const socketRoomMap = new Map(); // socketId -> { roomId, playerId }

export function addMapping(socketId, roomId) {
  socketRoomMap.set(socketId, { roomId });
}

export function hasMapping(socketId) {
  return socketRoomMap.has(socketId);
}

export function removeMapping(socketId) {
  socketRoomMap.delete(socketId);
}

export function getMapping(socketId) {
    return socketRoomMap.get(socketId); // { roomId, playerId } or undefined
}


