import eventBus from '../events/eventBus.js';

export default function handleEventBus(io) {
  const roomEvents = [
    "GAME_STARTED",
    "ROUND_STARTED",
    "WORD_SET",
    "TIMER_TICK",
    "TIMER_END",
    "DRAW",
    "ON_FILL",
    "CANVAS_SYNC",
    "CLEAR_CANVAS",
    "CHAT",
    "SCOREBOARD",
    "GAME_ENDED",
    "TIMER_CHECKPOINT",
    "HINT_GENERATED"
  ];

  const playerEvents = [
    "WORD_CHOICES",
    "CORRECT_GUESS",
    "GAME_STATE"

  ];

  roomEvents.forEach(event => {
    eventBus.on(event, (roomId, payload) => {
      console.log(`Emitting event ${event} to room ${roomId} with data:`, payload);
      io.to(roomId).emit(event, payload);
    });
  });

  playerEvents.forEach(event => {
    eventBus.on(event, (socketId, payload) => {
      console.log(`Emitting event ${event} to player ${socketId} with data:`, payload);
      io.to(socketId).emit(event, payload);
    });
  });
}
