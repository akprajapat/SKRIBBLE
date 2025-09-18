import eventBus from "./eventBus.js";

/**
 * Emits a chat message to a room
 * @param {Object} params
 * @param {string} params.roomId - ID of the room
 * @param {boolean} [params.system=false] - If true, sends as system message
 * @param {string} [params.username] - Username of sender (not needed for system messages)
 * @param {string} params.message - The chat message
 */
export function sendChatEvent({roomId=null, system = false, username = null, message }) {
  if (system) {
    eventBus.emit("CHAT",  roomId, { system: true, text: message } );
  } else {
    eventBus.emit("CHAT", roomId,  { system:false, username, text: message } );
  }
}

/**
 * Emits game started event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {Array<{id: string, name: string}>} payload.players - List of players in game
 */
export function emitGameStartedEvent(roomId, payload) {
  eventBus.emit("GAME_STARTED", roomId, payload);
}

/**
 * Emits round started event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {number} payload.round - Current round number
 * @param {string} payload.drawerId - ID of player who's drawing
 * @param {string} [payload.phase] - Current phase of the round must be "TURN"
 */
export function emitRoundStartedEvent(roomId, payload) {
  eventBus.emit("ROUND_STARTED", roomId, payload);
}

/**
 * Emits word set event with masked word
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {string} payload.word - Masked word (e.g., "____")
 */
export function emitWordSetEvent(roomId, payload) {
  eventBus.emit("WORD_SET", roomId, payload);
}

/**
 * Emits timer tick event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {number} payload.timeLeft - Seconds remaining
 * @param {string} [payload.type] - type of timer (e.g., "TURN", "WORD_SELECTION")
 */
export function emitTimerTickEvent(roomId, payload) {
  eventBus.emit("TIMER_TICK", roomId, payload);
}

/**
 * Emits timer end event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {number} payload.finalScore - Final score of the round
 */
export function emitTimerEndEvent(roomId, payload) {
  eventBus.emit("TIMER_END", roomId, payload);
}

/**
 * Emits draw event for canvas strokes
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {Object} payload - Contains from, to coordinates and style
 */
export function emitDrawEvent(roomId, payload) {
  console.log("Emitting DRAW event with payload:", payload, roomId);
  eventBus.emit("DRAW", roomId, payload);
}

/**
 * Emits canvas fill event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {string} payload.color - Fill color
 */
export function emitOnFillEvent(roomId, payload) {
  eventBus.emit("ON_FILL", roomId, payload);
}

/**
 * Emits clear canvas event
 * @param {string} roomId - ID of the room
 */
export function emitClearCanvasEvent(roomId) {
  eventBus.emit("CLEAR_CANVAS", roomId, {});
}

/**
 * requesting get canvas to drawer
 * @param {*} socketId socket of drawer
 * @param {*} payload  
 * @param {uuidv4} payload.requestId uuidv4 unique request id for particular new player.
 */

export function emitGetCanvasEvent(socketId, payload) {
  eventBus.emit("GET_CANVAS", socketId, payload);
}

/**
 * Emits canvas sync event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {Base64URLString} payload.image - 
 */
export function emitCanvasSyncEvent(roomId, payload) {
  eventBus.emit("CANVAS_SYNC", roomId, payload);
}
/**
 * Emits scoreboard update
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {Array<{id: string, name: string, score: number}>} payload.scores
 * @param {string} payload.word - Revealed word at round end
 * @param {string} [payload.phase] - must be "SHOW_SCOREBOARD"
 */
export function emitScoreboardEvent(roomId, payload) {
  eventBus.emit("SCOREBOARD", roomId, payload);
}

/**
 * Emits game ended event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {number} payload.finalScore - Final score of the game
 */
export function emitGameEndedEvent(roomId, payload) {
  eventBus.emit("GAME_ENDED", roomId, payload);
}

/**
 * Emits timer checkpoint event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {number} payload.timeLeft - Time left at the checkpoint
 */
export function emitTimerCheckpointEvent(roomId, payload) {
  eventBus.emit("TIMER_CHECKPOINT", roomId, payload);
}

/**
 * Emits hint generated event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {string} payload.hint - The generated hint
 */
export function emitHintGeneratedEvent(roomId, payload) {
  eventBus.emit("HINT_GENERATED", roomId, payload);
}

/**
 * Emits word choices to specific player
 * @param {string} socketId - Socket ID of drawer
 * @param {Object} payload
 * @param {Array<string>} payload.choices - Array of word choices
 */
export function emitWordChoicesEvent(socketId, payload) {
  eventBus.emit("WORD_CHOICES", socketId, payload);
}

/**
 * Emits word choices started event
 * @param {string} roomId - ID of the room
 * @param {Object} payload - phase Update - word_selection
 * @param {string} [payload.phase] - must be "WORD_SELECTION"
 * @param {number} [payload.drawerId] - who will choose the word
 */
export function emitWordChoicesStartedEvent(roomId, payload) {
  eventBus.emit("WORD_CHOICES_STARTED", roomId, payload);
}

/**
 * Emits correct guess event
 * @param {string} socketId - Socket ID of guesser
 * @param {Object} payload
 * @param {string} payload.playerId - ID of player who guessed
 * @param {number} payload.points - Points earned
 */
export function emitCorrectGuessEvent(socketId, payload) {
  eventBus.emit("CORRECT_GUESS", socketId, payload);
}

/**
 * Emits game state event
 * @param {string} socketId - Socket ID of the player
 * @param {Object} payload
 * @param {string} payload.roomId - ID of the room
 * @param {Object} payload.gameData - Current game data
 */
export function emitGameStateEvent(socketId, payload) {
  eventBus.emit("GAME_STATE", socketId, payload);
}

/**
 * Emits player list update event
 * @param {string} roomId - ID of the room
 * @param {Object} payload
 * @param {Array<{id: string, name: string, score: number}>} payload.players - Updated list of players
 */
 export function emitPlayerListUpdateEvent(roomId, payload) {
  eventBus.emit("PLAYER_LIST_UPDATE", roomId, payload);
}