import { v4 as uuidv4 } from 'uuid';

import { 
  emitGameStartedEvent, 
  emitRoundStartedEvent,
  emitWordChoicesEvent,
  sendChatEvent,
  emitScoreboardEvent,
  emitGameEndedEvent,
  emitDrawEvent,
  emitClearCanvasEvent,
  emitOnFillEvent,
  emitGameStateEvent,
  emitWordChoicesStartedEvent,
  emitGetCanvasEvent,
  emitPlayerListUpdateEvent
} from "../events/emitEvents.js";

import Timer from "./timer.js";
import Words from "./words.js";
import Difficulty from "../constants/difficulty.js";
import PHASE from "../constants/phase.js";
import generateWordList from "../utils/wordGeneratorAI.js";
import { updateRoomGameEnded } from '../services/roomService/roomService.js';

/**
 * Emits (to eventBus):
 * - GAME_STARTED        { roomId, players }
 * - ROUND_STARTED       { roomId, round, drawerPlayerId, word }
 * - WORD_CHOICES        { roomId, drawerPlayerId, choices: [a,b,c] }
 * - WORD_SET            { roomId, word }
 * - TIMER_TICK          { roomId, timeLeft } (forwarded by Timer)
 * - TIMER_END           { roomId } (forwarded by Timer)
 * - DRAW                { roomId, strokeData }
 * - CLEAR_CANVAS        { roomId }
 * - CHAT                { roomId, message }
 * - CORRECT_GUESS       { roomId, playerId, points }
 * - SCOREBOARD          { roomId, round, scores:[{id,name,score}], nextDrawerPlayerId? }
 * - GAME_ENDED          { roomId, scores:[...] }
 * - GAME_STATE          { roomId, round,timeleft,word,drawerId, players }
 */

const WORD_SELECTION_TIME = 10; // seconds to choose word
const SHOW_SCOREBOARD_TIME = 5; // seconds to show scoreboard

export default class Game {
  constructor({ roomId, totalRounds = 3, maxPlayers = 8, turnSeconds = 60, difficulty = Difficulty.MEDIUM }) {
    this.roomId = roomId;
    this.totalRounds = totalRounds;
    this.maxPlayers = maxPlayers;
    this.turnSeconds = turnSeconds;
    this.difficulty = difficulty;

    this.players = [];
    this.drawerIndex = 0;
    this.round = 1;
    this.started = false;

    this.phase = null; // "WORD_SELECTION", "TURN", "SCOREBOARD"
    this.words = null;
    this.wordChoices = [];
    this.scores = new Map();
    this.guessedIds = new Set();
    this.timer = new Timer({ roomId, durationSec: turnSeconds });
    this.pendingCanvasRequests = new Map();
    
  }

  _getGameState() {
    return {
      roomId: this.roomId,
      round: this.round,
      timeLeft: this.timer.timeLeft,
      type: this.timer.type,
      phase: this.phase,
      started: this.started,
      word: this.words.getMaskedWord(),
      drawerId: this.players[this.drawerIndex].id,
      players: this._serializePlayersList(),

    };
  }

  resetGameState() {
    this.started = false;
    this.phase = null;
    this.round = 1;
    this.drawerIndex = 0;
    this.scores.clear();
    this.guessedIds.clear();
    this.timer.stop();
    this.pendingCanvasRequests.clear();
    this.drawerLeft = false;
  }

  _serializePlayersList(){
    return this.players.map(player => ({
    id: player.id,
    name: player.name,
    score: player.score || 0,
    rank: player.rank
  }))

  }
  _updateDrawerIndex() {
    this.drawerIndex--;
    if (this.drawerIndex < 0) {
      this.round++;
      this.drawerIndex = this.players.length - 1;
    }
  }

  _calculateScore(){
    return Math.min(450, this.timer.timeLeft * 10);
  }

  _calculateScoreForDrawer(){
    const base = 50;
    const correctGuessers = this.guessedIds.size;
    const bonusPerGuesser = 50;
    return base + (correctGuessers * bonusPerGuesser);
  }

  _getPlayerById(id) {
    return this.players.find(player => player.id === id);
  }

  async _updateScoresAndRanks() {
    const newScores = [];
    this.players.forEach(p => {
      const updatedScore = p.updateScore(this.scores[p.id]);
      newScores.push({ id: p.id, score: updatedScore });
    });

    newScores.sort((a, b) => b.score - a.score);
    let rank = 0;
    let prevScore = null;

    newScores.forEach((item) => {
      if (item.score !== prevScore) {
        rank++;
        prevScore = item.score;
      }
      this._getPlayerById(item.id).updateRank(rank);
    });
  }

  async _createTimerForTurn(){
    this.timer = new Timer({ roomId: this.roomId, durationSec: this.turnSeconds, type: PHASE.TURN });
    this.timer.start(this.turnSeconds);
    this.words.registerHintCheckpoints(this.timer);
    this.timer.addCheckpoint(0,() => this._endTurn() );
  }

  async _createTimerForWordSelection(){
    this.timer = new Timer({ 
      roomId: this.roomId,
      durationSec: WORD_SELECTION_TIME,
      type: PHASE.WORD_SELECTION
    });
    this.timer.start();
    this.timer.addCheckpoint(0,() => {
      this.selectedWord(this.wordChoices[0]);
    });
  }

  async _createTimerForShowScoreboard(){
    this.timer = new Timer({ 
      roomId: this.roomId,
      durationSec: SHOW_SCOREBOARD_TIME,
      type: PHASE.SCOREBOARD 
    });
    this.timer.start();
    this.timer.addCheckpoint(0,() => {
      this._startWordSelection();
    });
  }

  async _sendWordChoices() {
    this.phase = PHASE.WORD_SELECTION;
    const drawer = this.players[this.drawerIndex];

    emitWordChoicesStartedEvent(this.roomId, {
      phase: this.phase,
      drawerId: drawer.id
    });

    this.wordChoices = this.words.getWordChoices();

    emitWordChoicesEvent(drawer.socket, { 
      wordChoices: this.wordChoices
    });
  }

  selectedWord(word) {
    this.timer.stop();
    this.words.setChoosedWord(word);
    this._startTurn();
  }


  _createScoresToShow() {
    const scoresToShow = new Map();
    this.players.forEach(p => {
      scoresToShow[p.id] = this.scores[p.id] || 0;
    });
    return scoresToShow;
  }


  async _showScoreboard() {
    this._createTimerForShowScoreboard();
    this.phase = PHASE.SCOREBOARD;

    emitScoreboardEvent(this.roomId, { 
      scores: this._createScoresToShow(),
      word: this.words.getCurrentWord(),
      round: this.round,
      phase: this.phase
    });
  }

  isDrawer(socketId) {
    const drawer = this.players[this.drawerIndex];
    return drawer && drawer.socket === socketId;
  }



  handleGuess(socketId, guessRaw) {
    const p = this.players.find(pl => pl.socket === socketId);
    if (this.guessedIds.has(socketId)) return;
    const guess = guessRaw.trim().toLowerCase();
    const drawerId = this.players[this.drawerIndex].id;
    
    if (this.words.isCorrectGuess(guess)) {
      const points = this._calculateScore();
      if (p) {
        this.guessedIds.add(p.id);
        this.scores[p.id] = points;
        sendChatEvent({ 
          roomId: this.roomId, 
          system: true, 
          message: ` ${p.name} guessed the word!`,
          color: 'green'
        });

        const aliveGuessers = this.players.filter(pl => pl.id !== drawerId);
        const allGuessed = aliveGuessers.every(pl => this.guessedIds.has(pl.id));
        if (allGuessed) {
          this.timer.stop();
          this._endTurn();
        }
      }
    } else {
      sendChatEvent({roomId: this.roomId, system:false, username: p.name, message: guess  });
    }
  }

  _endTurn() {
    sendChatEvent({ 
      roomId: this.roomId, 
      system: true, 
      message: ` The word was: ${this.words.getCurrentWord()}`,
      color: 'blue'
    });

    // Calculate drawer score
    if (!this.drawerLeft) {
      this.scores[this.players[this.drawerIndex].id] = this._calculateScoreForDrawer();
    }
    this._showScoreboard();
    this._updateDrawerIndex();
    this._updateScoresAndRanks();
    this.guessedIds.clear();
    if (this.round > this.totalRounds) {
      this._endGame();
    }
    this.drawerLeft = false;
  }

  _endGame() {
    sendChatEvent({ 
      roomId: this.roomId, 
      system: true, 
      message: ` The Game has ended!`,
      color: 'blue'
    });
    this.timer.stop();
    const scores = this.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
    emitGameEndedEvent(this.roomId, { scores, phase:  PHASE.GAME_ENDED});
    this.started = false;
    updateRoomGameEnded(this.roomId);
  }

  async start(players) {
    this.players = players;
    this.drawerIndex = players.length - 1;
    this.started = true;
    emitGameStartedEvent(this.roomId, { roomId: this.roomId, players: this.players });
    const wordList = await generateWordList(this.totalRounds,this.maxPlayers,this.difficulty)
    this.words = new Words(this.roomId, wordList);
    players.forEach(p => {
      sendChatEvent({ 
        roomId: this.roomId, 
        system: true, 
        message: ` ${p.name} joined the room`,
        color: 'green'
      });
    });
    this._startWordSelection();
  }

  async _startWordSelection() {
    if (this.players.length < 2) {
      return this._endGame();
    }
    this._sendWordChoices();
    this._createTimerForWordSelection();
    this.guessedIds.clear();
    this.scores.clear();
  }

  async _startTurn() {
    const drawer = this.players[this.drawerIndex];
    console.log("Starting turn with word:", this.words.getCurrentWord());
    this.phase = PHASE.TURN;

    sendChatEvent({ 
      roomId: this.roomId, 
      system: true, 
      message: ` ${drawer.name} is drawing now!`,
      color: 'blue'
    });
    emitRoundStartedEvent(this.roomId, {
      phase: this.phase,
      round: this.round,
      drawerId: drawer.id,
      players: this.players,
    });

    this._createTimerForTurn();
  }

  // Canavas Events

  onDraw(strokeData) {
    emitDrawEvent(this.roomId,  strokeData );
  }

  onFill(fillData) {
    emitOnFillEvent(this.roomId, fillData);
  }

  onClear() {
    emitClearCanvasEvent(this.roomId);
  }

  clearCanvas() {
    emitClearCanvasEvent(this.roomId);
  }

  getCanvasFromDrawer() {
    const requestId = uuidv4();
    return new Promise((resolve) => {
      this.pendingCanvasRequests.set(requestId, (image) => {
        resolve(image);
      });
      emitGetCanvasEvent(this.players[this.drawerIndex].socket, { requestId });
    });
  }

  canvasUpdate(requestId, image) {
    if (this.pendingCanvasRequests.has(requestId)) {
      const callback = this.pendingCanvasRequests.get(requestId);
      this.pendingCanvasRequests.delete(requestId);
      callback(image);
    }
  }

  async handlePlayerJoin(player){
    const image = await this.getCanvasFromDrawer();
    emitGameStateEvent(player.socket, {
      ...this._getGameState(),
      image: image
    });
    emitPlayerListUpdateEvent(this.roomId, { players: this._serializePlayersList() });
  }

  handlePlayerLeave(leftPlayerSocketId) {
    const idx = this.players.findIndex(p => p.socket === leftPlayerSocketId);
    if (idx === -1) return;

    if (idx < this.drawerIndex) {
      this.drawerIndex--;
    } 

    const drawer = this.players[this.drawerIndex];
    if (drawer && drawer.socket === leftPlayerSocketId) {
      this.drawerLeft = true;
      this.drawerIndex--;
      this.timer.stop();
      this.players.splice(idx, 1);
      this._endTurn();
    }
    else {
      this.players.splice(idx, 1);
    }

    if (this.players.length < 2) {
      this._endGame();
      return;
    }
    emitPlayerListUpdateEvent(this.roomId, { players: this._serializePlayersList() });
  }

}
