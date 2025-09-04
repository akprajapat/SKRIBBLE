import eventBus from "../events/eventBus.js";
import sendChat from "../utils/sendChat.js";
import Timer from "./timer.js";
import Words from "./words.js";
import Difficulty from "../constants/difficulty.js";
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
 * - GAME_STATE          { roomId, round,timeleft,word,drawerId,currentCanvas, players }
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

    this.words = null;
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
      currentCanvas: this.canvas,
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
        score: this.scores[player.id] || 0,
      }))
    };
  }

  _nextDrawerIndex() {
    if (this.players.length === 0) return 0;
    return (this.drawerIndex + 1) % this.players.length;
  }

  _calculateScore(){
    const timeFactor = Math.max(1, this.timer.timeLeft);
    const base = 100;
    return Math.min(450, base + timeFactor * 10);
  }

  _getPlayerById(id) {
    return this.players.find(player => player.id === id);
  }

  _updateScoresAndRanks() {
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

  _createTimerForTurn(){
    this.timer = new Timer({ roomId: this.roomId, durationSec: this.turnSeconds });
    this.timer.start(this.turnSeconds);
    this.words.registerHintCheckpoints(this.timer);
    this.timer.addCheckpoint(0,() => this._endTurn() );
  }

  async _startTurn() {
    if (this.players.length < 2) {
      return this._endGame();
    }
    this.drawerIndex = this._nextDrawerIndex();

    this.guessedIds.clear();
    this.scores.clear();

    const drawer = this.players[this.drawerIndex];
    const wordChoices = this.words.getWordChoices();
    drawer.sendEvent("WORD_CHOICES", { drawerId: drawer.id, choices: wordChoices });
    this.setChoosedWord(drawer.id, wordChoices[0]);

    eventBus.emit("ROUND_STARTED", this.roomId, {
      round: this.round,
      drawerId: drawer.id,
    });

    this._createTimerForTurn();
  }

  isDrawer(socketId) {
    const drawer = this.players[this.drawerIndex];
    return drawer && drawer.socket === socketId;
  }

  setChoosedWord(playerId, word) {
    const drawer = this.players[this.drawerIndex];
    if (!drawer || drawer.id !== playerId) return;
    this.currentWord = this.words.setChoosedWord(word);
    eventBus.emit("WORD_SET", this.roomId, { word: this.currentWord });
  }

  async start(players) {
    this.started = true;
    this.players = players;
    this.drawerIndex = 0;
    this.round = 1;
    // const words = await generateWordList(this.totalRounds, this.maxPlayers, this.difficulty);
    const words = wordList;

    eventBus.emit("GAME_STARTED", this.roomId, { players: this.players });
    
    players.forEach(player => {
      sendChat({ userId: player.id, system: true, message: `Player ${player.name} joined the room.` });
    });

    this.words = new Words(this.roomId, words);
    await this._startTurn();
    console.log(this.wordChoices);
  }

  handleGuess(playerId, guess) {
    if (this.guessedIds.has(playerId)) return;

    if (this.words.isCorrectGuess(guess)) {
      const p = this.players.find(pl => pl.id === playerId);
      if (p) {
        this.guessedIds.add(playerId);
        this.scores[p.id] = this._calculateScore();

        eventBus.emit("CORRECT_GUESS", p.socket, { word: this.words.getCurrentWord() });

        this.sendChat({ system: true, message: `Player ${p.name} guessed the word!` });

        const aliveGuessers = this.players.filter(pl => pl.connected && pl.id !== this.players[this.drawerIndex].id);
        const allGuessed = aliveGuessers.every(pl => this.guessedIds.has(pl.id));
        if (allGuessed) {
          this.timer.stop();
          this._endTurn();
        }
      }
    }
  }

  _endTurn() {
    eventBus.emit("SCOREBOARD", this.roomId, {
      round: this.round,
      word: this.words.getCurrentWord(),
      scores: this.scores,
    });

    this._updateScoresAndRanks();

    if (this.round > this.totalRounds) {
      this._endGame();
    } else {
      this.guessedIds.clear();
      this._startTurn();
    }
  }

  _endGame() {
    const scores = this.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
    eventBus.emit("GAME_ENDED", this.roomId, { scores });
  }

  drawStroke(strokeData) {
    eventBus.emit("DRAW", this.roomId,  strokeData );
  }

  onFill(fillData) {
    eventBus.emit("ON_FILL", this.roomId, fillData );
  }

  clearCanvas() {
    eventBus.emit("CLEAR_CANVAS", this.roomId, {});
    console.log("Canvas cleared");
  }

  sendGameState(socketId) {
    eventBus.emit("GAME_STATE", socketId, this._getGameState());
  }

  handlePlayerLeave(leftPlayerSocketId) {
    const idx = this.players.findIndex(p => p.socket === leftPlayerSocketId);
    if (idx === -1) return;
    this.players.splice(idx, 1);

    // If drawer left: move to next drawer and end current turn immediately
    const drawer = this.players[this.drawerIndex];
    if (drawer && drawer.id === leftPlayerId) {
      this.timer.stop();
      this._endTurn();
    }
  }

}
