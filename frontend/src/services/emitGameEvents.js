import socket from "./socket";

export function emitGameEvent(event, payload) {
  console.log(`[GameEvent Emit] ${event}`, payload);
  socket.emit(event, payload);
}

export const startGameEvent = (roomId, playerId) =>
  emitGameEvent("START_GAME", { roomId, playerId });

export const selectWordEvent = (roomId, playerId, word) =>
  emitGameEvent("SELECTED_WORD", { roomId, playerId, word });

export const guessWordEvent = (roomId, playerId, guess) =>
  emitGameEvent("GUESS_WORD", { roomId, playerId, guess });

export const drawStrokeEvent = (roomId, strokeData) =>
  emitGameEvent("DRAW", { roomId, strokeData });

export const clearCanvasEvent = (roomId) =>
  emitGameEvent("CLEAR_CANVAS", { roomId });

export const endTurnEvent = (roomId) =>
  emitGameEvent("END_TURN", { roomId });

export const onFillEvent = (roomId, fillData) =>
  emitGameEvent("ON_FILL", { roomId, fillData });

export const chatEvent = (roomId, playerId, message) =>
  emitGameEvent("CHAT", { roomId, playerId, message });

export const getGameStateEvent = (roomId) =>
  emitGameEvent("GET_GAME_STATE", { roomId });