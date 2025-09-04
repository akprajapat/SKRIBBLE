import {
  selectedWord,
  guessWord,
  drawStroke,
  clearCanvas,
  onFill,
  endTurn
} from "../services/gameService.js";
import getRoom, { startGameByHost } from "../services/roomService/roomService.js";

export default function handleGameEvents(socket) {
  socket.on("START_GAME", async ({ roomId }, cb) => {
    console.log(`START_GAME event received { roomId: ${roomId}, playerId: ${socket.id} }`);
    const result = startGameByHost(roomId, socket.id);
    cb?.(result);
  });

  socket.on("SELECTED_WORD", ({ roomId, word }, cb) => {
    console.log(`SELECTED_WORD event received { roomId: ${roomId}, word: ${word} }`);
    const result = selectedWord(roomId, socket.id, word);
    cb?.(result);
  });

  socket.on("GUESS_WORD", ({ roomId, guess }) => {
    console.log(`GUESS_WORD event received { roomId: ${roomId}, guess: ${guess} }`);
    guessWord(roomId, socket.id, guess);
  });

  socket.on("DRAW", ({ roomId, strokeData }) => {
    console.log(`DRAW event received { roomId: ${roomId}, strokeData: ${JSON.stringify(strokeData)}, socketId: ${socket.id} }`);
    drawStroke(roomId, socket.id, strokeData);
  });

  socket.on("CLEAR_CANVAS", ({ roomId }) => {
    console.log(`CLEAR_CANVAS event received { roomId: ${roomId} }`);
    clearCanvas(roomId, socket.id);
  });

  socket.on("ON_FILL", ({ roomId, fillData }) => {
    console.log(`ON_FILL event received { roomId: ${roomId}, fillData: ${fillData} }`);
    onFill(roomId, socket.id, fillData);
  });

  socket.on("END_TURN", ({ roomId }) => {
    console.log(`END_TURN event received { roomId: ${roomId} }`);
    endTurn(roomId, socket.id);
  });

  socket.on("GET_GAME_STATE", ({ roomId }) => {
    console.log(`GET_GAME_STATE event received { roomId: ${roomId} }`);
    const gameState = getGameState(roomId);
    socket.emit("GET_GAME_STATE", gameState);
  });

  socket.on("CANVAS_SYNC", ({ roomId, image }) => {
    socket.to(roomId).emit("CANVAS_SYNC", { image });
  });
}
