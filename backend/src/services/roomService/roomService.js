import JoinPrivateRoom from "./joinPrivateRoom.js";
import JoinPublicRoom from "./joinPublicRoom.js";
import JoinPublicRoomById from "./joinPublicRoomById.js";
import CreatePrivateRoom from "./createPrivateRoom.js";
import { getMapping, removeMapping } from "../socketMapService.js";

const rooms = new Map(); 
const createPrivate = new CreatePrivateRoom(rooms);
const joinPublic = new JoinPublicRoom(rooms);
const joinPublicById = new JoinPublicRoomById(rooms);
const joinPrivate = new JoinPrivateRoom(rooms);

export function createPrivateRoom(args) {
  return createPrivate.execute(args);
}

export function joinPublicRoom(args) {
  return joinPublic.execute(args);
}

export function joinPublicRoomById(args) {
  return joinPublicById.execute(args);
}

export function joinPrivateRoom(args) {
  return joinPrivate.execute(args);
}

export function leaveRoom(socketId) {
  const roomId = getMapping(socketId);  
  if (!roomId) return { error: "Map { socketId: roomId } not found" };

  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };

  room.removePlayerBySocketId(socketId);
  removeMapping(socketId);
  return { success: true };
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function hasRoom(roomId) {
  return rooms.has(roomId);
}

export function updateRoomGameEnded(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.gameEnded();
  }
}

export function startGameByHost(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };

  if (room.hostId !== socketId) {
    return { error: "Only host can start the game" };
  }
  room.startGame();
  return { success: true };
}

export function validateRoom(roomId) {
const  isValid = rooms.has(roomId);
  if (!isValid) {
    return { roomIsValid: false, playerAlreadyJoinedRoom: false };
  }
  return { roomIsValid: true, playerAlreadyJoinedRoom: roomId === getMapping(socketId) };
}

export default getRoom;