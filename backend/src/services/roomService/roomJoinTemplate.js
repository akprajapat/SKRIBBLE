import { addMapping } from "../socketMapService.js";

export default class RoomJoinTemplate {
  constructor(roomsMap) {
    this.rooms = roomsMap;
  }

  execute({ username, socket, roomId = null, options = {} }) {
    let room;
    room = this.findRoom(roomId, options);

    if (!room && this.shouldCreateRoom()) {
      room = this.createRoom(options);
      this.rooms.set(room.id, room);
    }

    const error = this.validateRoom(room);
    if (error) return { error };

    const player = room.addPlayer({ name: username, socket: socket.id });
    socket.join(room.id);

    addMapping(socket.id, room.id, player.id);

    this.afterJoin(room, player.socket);

    return { roomId: room.id, playerId: player.id };
  }

  findRoom() { throw new Error("findRoom() must be implemented"); }
  shouldCreateRoom() { return false; }
  createRoom() { throw new Error("createRoom() must be implemented"); }
  validateRoom() { return null; } // return error message or null

  afterJoin(room, playerSocketId) {
    if (room.isGameStarted()) {
      room.sendGameState(playerSocketId);
    } else {
      room.startGame(playerSocketId);
    }
  }
}
