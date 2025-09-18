import {
  joinPublicRoom,
  joinPrivateRoom,
  joinPublicRoomById,
  createPrivateRoom,
  leaveRoom,
  validateRoom
  // startGameByHost,
} from "../services/roomService/roomService.js";

export default function handleRoomEvents(socket) {
  socket.on("joinPublicRoom", ({ username }, cb) => {
    console.log(`joinPublicRoom event received { username: ${username} }`);
    const result = joinPublicRoom({ username, socket});
    cb(result);
  });

  socket.on("joinPrivateRoom", ({ roomId, username }, cb) => {
    console.log(`joinPrivateRoom event received { roomId: ${roomId}, username: ${username} }`);
    const result = joinPrivateRoom({ username, socket, roomId });
    cb(result);
  });

  socket.on("joinPublicRoomById", ({ roomId, username }, cb) => {
    console.log(`joinPublicRoomById event received { roomId: ${roomId}, username: ${username} }`);
    const result = joinPublicRoomById({ username, socket, roomId });
    cb(result);
  });

  socket.on("createPrivateRoom", ({ username, data }, cb) => {
    console.log(`createPrivateRoom event received { username: ${username}, data: ${JSON.stringify(data)} }`);
    const result = createPrivateRoom({ username, socket });
    cb(result);
  });

  socket.on("startGameByHost", ({ roomId, playerId }, cb) => {
    console.log(`startGameByHost event received { roomId: ${roomId}, playerId: ${playerId} }`);
    const result = startGameByHost({ roomId, playerId});
    cb(result);
  });

  socket.on("PLAYER_LEAVE", ({ roomId }) => {
    console.log(`PLAYER_LEAVE event received { roomId: ${roomId}, socketId: ${socket.id} }`);
    leaveRoom(socket.id);
  });

}

