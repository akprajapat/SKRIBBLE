import rooms from "./roomService/roomJoinTemplate.js";

/**
 * Start the game for a given room
 */
export async function startGame(roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };

  if (!room.canStart(playerId)) {
    return { error: "Only host can start game or conditions not met" };
  }

  await room.startGame(io);
  return { success: true };
}

/**
 * Player selects a word (only current drawer can select)
 */
export function selectWord(roomId, playerId, word) {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };

  return room.game.selectWord(playerId, word);
}

/**
 * Handle guess from player
 */
export function guessWord(roomId, playerId, guess) {
  const room = rooms.get(roomId);
  if (!room) return;

  const game = room.game;
  if (!game || !game.started) return;

  game.handleGuess(io, playerId, guess);
}

/**
 * Broadcast draw strokes from current drawer
 */
export function drawStroke(roomId, socketId, strokeData) {
  const room = rooms.get(roomId);
  if (!room || !room.game) return;

  const drawer = room.getCurrentDrawer();
  if (drawer.socket !== socketId) return; // only drawer can draw

  io.to(roomId).emit("draw", strokeData);
}

/**
 * Clear the canvas for everyone (only drawer can clear)
 */
export function clearCanvas(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.game) return;

  io.to(roomId).emit("clearCanvas");
}

/**
 * End current turn manually (only drawer or host can do this)
 */
export function endTurn(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.game) return;

  room.game.endTurn(io);
}

/**
 * Show scoreboard between rounds
 */
export function showScoreboard(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.game) return;

  const scores = room.game.getScoreboard();
  io.to(roomId).emit("scoreboard", scores);
}

/**
 * Get current game state (for resync or reconnect)
 */
export function getGameState(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.game) return null;

  return room.game.getSyncState();
}

/**
 * Handle player leaving during game
 */
export function handlePlayerLeave(roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.removePlayer(playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return;
  }

  // if (room.game.started) {
  //   room.game.handleDrawerLeft();
  // }
}
