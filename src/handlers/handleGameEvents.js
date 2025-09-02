import {
  startGame,
  selectWord,
  guessWord,
  drawStroke,
  clearCanvas,
  endTurn,
  showScoreboard,
  handlePlayerLeave
} from "../services/gameService.js";
import rooms from "../services/roomService/roomJoinTemplate.js";

export default function handleGameEvents(socket) {
  socket.on("startGame", async ({ roomId, playerId }, cb) => {
    console.log(`startGame event received { roomId: ${roomId}, playerId: ${playerId} }`);
    const result = await startGame(roomId, playerId);
    cb?.(result);
  });

  socket.on("selectWord", ({ roomId, playerId, word }, cb) => {
    console.log(`selectWord event received { roomId: ${roomId}, playerId: ${playerId}, word: ${word} }`);
    const result = selectWord(roomId, playerId, word);
    cb?.(result);
  });

  socket.on("guessWord", ({ roomId, playerId, guess }) => {
    console.log(`guessWord event received { roomId: ${roomId}, playerId: ${playerId}, guess: ${guess} }`);
    guessWord(roomId, playerId, guess);
  });

  socket.on("draw", ({ roomId, strokeData }) => {
    console.log(`draw event received { roomId: ${roomId}, strokeData length: ${strokeData?.length} }`);
    drawStroke(roomId, socket.id, strokeData);
  });

  socket.on("clearCanvas", ({ roomId }) => {
    console.log(`clearCanvas event received { roomId: ${roomId} }`);
    clearCanvas(roomId);
  });

  socket.on("endTurn", ({ roomId }) => {
    console.log(`endTurn event received { roomId: ${roomId} }`);
    endTurn(roomId);
  });

  socket.on("showScoreboard", ({ roomId }) => {
    console.log(`showScoreboard event received { roomId: ${roomId} }`);
    showScoreboard(roomId);
  });

  socket.on("getGameState", ({ roomId }) => {
    console.log(`getGameState event received { roomId: ${roomId} }`);
    const gameState = getGameState(roomId);
    socket.emit("gameState", gameState);
  });

  socket.on("TIMER_END", ({ roomId }) => {
    console.log(`TIMER_END event received { roomId: ${roomId} }`);
    endTurn(roomId);
  });
}
