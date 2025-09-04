import getRoom from "./roomService/roomService.js";

/**
 * Get game instance with proper validation
 */
function getGame(roomId) {
  const room = getRoom(roomId);
  if (!room) return { game: null, error: "Room not found" };

  const game = room.game;
  if (!game || !game.started) return { game: null, error: "Game not started" };

  return { game, error: null };
}

/**
 * Player selects a word (only current drawer can select)
 */
export function selectedWord(roomId, socketId, word) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  if (!game.isDrawer(socketId)) return { error: "Not your turn" };
  return game.selectedWord(word);
}

/**
 * Handle guess from player
 */
export function guessWord(roomId, playerId, guess) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  
  return game.handleGuess(playerId, guess);
}

/**
 * Broadcast draw strokes from current drawer
 */
export function drawStroke(roomId, socketId, strokeData) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  if (!game.isDrawer(socketId)) return { error: "Not your turn" };
  return game.drawStroke(strokeData);
}

/**
 * Clear the canvas for everyone (only drawer can clear)
 */
export function clearCanvas(roomId, socketId) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  if (!game.isDrawer(socketId)) return { error: "Not your turn" };
  return game.clearCanvas();
}

export function onFill(roomId, socketId, fillData) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  if (!game.isDrawer(socketId)) return { error: "Not your turn" };
  console.log("event received at on Fill in gameService", fillData);
  return game.onFill(fillData);
}

/**
 * End current turn manually (only drawer or host can do this)
 */
export function endTurn(roomId) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  return game.endTurn();
}

/**
 * Show scoreboard between rounds
 */
export function showScoreboard(roomId) {
  const { game, error } = getGame(roomId);
  if (error) return { error };
  return game.getScoreboard();
}
