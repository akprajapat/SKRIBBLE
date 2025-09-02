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
 * - ROUND_STARTED       { roomId, round, drawerPlayerId, maskedWord }
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

  _nextDrawerIndex(from = this.drawerIndex) {
    if (this.players.length === 0) return 0;
    return (from + 1) % this.players.length;
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

  _addTimerForTurn(){
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

    eventBus.emit("ROUND_STARTED", {
      roomId: this.roomId,
      round: this.round,
      drawerId: drawer.id,
    });

    this._addTimerForTurn();
  }

  setChoosedWord(playerId, word) {
    const drawer = this.players[this.drawerIndex];
    if (!drawer || drawer.id !== playerId) return;
    this.currentWord = this.words.setChoosedWord(word);
    eventBus.emit("WORD_SET", { roomId: this.roomId, word: this.currentWord });
  }

  async start(players) {
    this.players = players;
    this.drawerIndex = 0;
    this.round = 1;
    // const words = await generateWordList(this.totalRounds, this.maxPlayers, this.difficulty);
    const words = wordList;

    eventBus.emit("GAME_STARTED", { roomId: this.roomId, players: this.players });
    
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

        eventBus.emit("CORRECT_GUESS", { roomId: this.roomId, socketId: p.socket, word: this.words.getCurrentWord() });

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
    eventBus.emit("SCOREBOARD", {
      roomId: this.roomId,
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
    eventBus.emit("GAME_ENDED", { roomId: this.roomId, scores });
  }

  onDraw(strokeData) {
    eventBus.emit("DRAW", { roomId: this.roomId, strokeData });
  }
  onClear() {
    eventBus.emit("CLEAR_CANVAS", { roomId: this.roomId });
  }

  onPlayerLeft(leftPlayerId) {
    const idx = this.players.findIndex(p => p.id === leftPlayerId);
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
