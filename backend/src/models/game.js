import { 
  emitGameStartedEvent, 
  emitRoundStartedEvent,
  emitWordSetEvent,
  emitWordChoicesEvent,
  sendChatEvent,
  emitCorrectGuessEvent,
  emitScoreboardEvent,
  emitGameEndedEvent,
  emitDrawEvent,
  emitClearCanvasEvent,
  emitOnFillEvent,
  emitGameStateEvent
} from "../events/emitEvents.js";

import Timer from "./timer.js";
import Words from "./words.js";
import Difficulty from "../constants/difficulty.js";
import timerType from "../constants/timerType.js";
import generateWordList from "../utils/wordGeneratorAI.js";
import wordList from "../constants/wordList.js";

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

    this.words = null;
    this.wordChoices = [];
    this.scores = new Map();
    this.guessedIds = new Set();
    this.timer = new Timer({ roomId, durationSec: turnSeconds });
    
  }

  _getGameState() {
    return {
      roomId: this.roomId,
      round: this.round,
      timeLeft: this.timer.timeLeft,
      word: this.words.getMaskedWord(),
      drawerId: this.players[this.drawerIndex].id,
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
        score: this.scores[player.id] || 0,
      }))
    };
  }

  _updateDrawerIndex() {
    this.drawerIndex--;
    if (this.drawerIndex < 0) {
      this.round++;
      this.drawerIndex = this.players.length - 1;
    }
  }

  _calculateScore(){
    const timeFactor = Math.max(1, this.timer.timeLeft);
    const base = 100;
    return Math.min(450, base + timeFactor * 10);
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
      const updatedScore = p.updateScore(this.scores[p.name]);
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
    this.timer = new Timer({ roomId: this.roomId, durationSec: this.turnSeconds, type: timerType.TURN });
    this.timer.start(this.turnSeconds);
    this.words.registerHintCheckpoints(this.timer);
    this.timer.addCheckpoint(0,() => this._endTurn() );
  }

  async _createTimerForWordSelection(){
    this.timer = new Timer({ roomId: this.roomId, durationSec: 20, type: timerType.WORD_SELECTION });
    this.timer.start(20);
    this.timer.addCheckpoint(0,() => {
      this.selectedWord(this.wordChoices[0]);
    });
  }

  async _createTimerForShowScoreboard(){
    this.timer = new Timer({ roomId: this.roomId, durationSec: 10, type: timerType.SHOW_SCOREBOARD });
    this.timer.start(10);
    this.timer.addCheckpoint(0,() => {
      this._startWordSelection();
    });
  }

  async _sendWordChoices() {
    const drawer = this.players[this.drawerIndex];
    this.wordChoices = this.words.getWordChoices();
    emitWordChoicesEvent(drawer.socket, { 
      phase: "WORD_SELECTION",
      drawerId: drawer.id,
      wordChoices: this.wordChoices
    });
  }

  selectedWord(word) {
    this.timer.stop();
    this.words.setChoosedWord(word);
    this._startTurn();
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
    emitRoundStartedEvent(this.roomId, {
      phase: "TURN",
      round: this.round,
      drawerId: drawer.id,
      players: this.players,
    });
    this._createTimerForTurn();
  }

  async _showScoreboard() {
    this._createTimerForShowScoreboard();
    emitScoreboardEvent(this.roomId, { 
      scores: this.scores,
      word: this.words.getCurrentWord(),
      round: this.round,
      phase: "SCOREBOARD"
    });
    this._updateScoresAndRanks();
  }

  isDrawer(socketId) {
    const drawer = this.players[this.drawerIndex];
    return drawer && drawer.socket === socketId;
  }

  async start(players) {
    this.players = players;
    this.drawerIndex = players.length - 1;
    this.started = true;
    this.words = new Words(this.roomId, wordList);
    emitGameStartedEvent(this.roomId, { roomId: this.roomId, players: this.players });
    players.forEach(p => {
      sendChatEvent({ 
        roomId: this.roomId, 
        system: true, 
        message: `Player ${p.name} joined the room` 
      });
    });
    await this._startWordSelection();
  }

  chooseWord(playerId, word) {
    this.words.setChoosedWord(word);
    emitWordSetEvent(this.roomId, { word: "_".repeat(this.currentWord.length) });
  }

  handleGuess(socketId, guessRaw) {
    const p = this.players.find(pl => pl.socket === socketId);
    if (this.guessedIds.has(socketId)) return;
    const guess = guessRaw.trim().toLowerCase();
    
    if (this.words.isCorrectGuess(guess)) {
      const points = this._calculateScore();
      if (p) {
        p.updateScore(points);
        this.guessedIds.add(p.id);
        this.scores[p.name] = points;
        sendChatEvent({ 
          roomId: this.roomId, 
          system: true, 
          message: ` ${p.name} guessed the word!` 
        });

        const aliveGuessers = this.players.filter(pl => pl.connected && pl.id !== this.players[this.drawerIndex].id);
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
    this.scores[this.players[this.drawerIndex].name] = this._calculateScoreForDrawer();
    this._showScoreboard();
    this._updateDrawerIndex();
    if (this.round > this.totalRounds) {
      this._endGame();
    } else {
      this.guessedIds.clear();
    }
  }

  _endGame() {
    const scores = this.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
    emitGameEndedEvent(this.roomId, { scores });
  }

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

  sendGameState(socketId) {
    emitGameStateEvent(socketId, this._getGameState());
  }

  handlePlayerLeave(leftPlayerSocketId) {
    const idx = this.players.findIndex(p => p.socket === leftPlayerSocketId);
    if (idx === -1) return;
    this.players.splice(idx, 1);
    if (this.players.length < 2) {
      this._endGame();
      return;
    }    // If drawer left: move to next drawer and end current turn immediately
    const drawer = this.players[this.drawerIndex];
    if (drawer && drawer.id === leftPlayerId) {
      this.timer.stop();
      this._endTurn();
    }
    if (idx <= this.drawerIndex) {
      this.drawerIndex--;
    }
  }
}
