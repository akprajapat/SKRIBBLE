import RoomType  from "../constants/roomType.js";
import DEFAULTS from "../constants/publicRoom.js";
import Player from "./player.js";
import generateRoomId from "../utils/idGenerator.js";
import Game from "./game.js";

export default class Room {
  constructor(DEFAULTS = {}) {
    this.id = generateRoomId();
    this.type = DEFAULTS.type;
    this.maxPlayers = DEFAULTS.maxPlayers;
    this.players = [];
    this._nextPlayerId = 1;
    this.hostId = null;
    this.gameStarted = false;
    this.game = new Game({
      roomId: this.id,
      maxPlayers: DEFAULTS.maxPlayers,
      totalRounds: DEFAULTS.totalRounds,
      turnSeconds: DEFAULTS.turnSeconds,
      difficulty: DEFAULTS.difficulty
    });
  }

  isFull() { return this.players.length >= this.maxPlayers; }

  addPlayer({name, socket}) {
    if (this.isFull()) return {error: "Room is Full"};
    const player = new Player({ id: this._nextPlayerId++, name, socket });
    this.players.push(player);
    if (this.players.length === 1) this.hostId = player.id;
    return player;
  }

  removeBySocket(socketId) {
    const idx = this.players.findIndex(p => p.socketId === socketId);
    if (idx === -1) return null;
    const [p] = this.players.splice(idx, 1);
    return p;
  }

  getPlayerBySocket(socketId) {
    return this.players.find(p => p.socketId === socketId);
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  canStartGame(requesterId=null) {
    if (this.gameStarted) return false;
    if (this.players.length < 2) return false;
    if (this.type === RoomType.PRIVATE) return requesterId === this.hostId;
    return true;
  }

  startGame(playerId=null) {
    if(this.canStartGame(playerId)){
      this.gameStarted = true;
      this.game.start(this.players);

    } 
  }
}
