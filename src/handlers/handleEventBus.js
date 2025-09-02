import eventBus from '../events/eventBus.js';

export default function handleEventBus(io) {
  const roomEvents = [
    "GAME_STARTED",
    "ROUND_STARTED",
    "WORD_SET",
    "TIMER_TICK",
    "TIMER_END",
    "DRAW",
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

  ];

  roomEvents.forEach(event => {
    eventBus.on(event, (payload) => {
      if (payload?.roomId) {
        console.log(`Emitting event ${event} to room ${payload.roomId} with data:`, payload);
        io.to(payload.roomId).emit(event, payload);
      }
    });
  });

  playerEvents.forEach(event => {
    eventBus.on(event, (payload) => {
      if (payload?.socketId) {
        console.log(`Emitting event ${event} to player ${payload.socketId} with data:`, payload);
        io.to(payload.socketId).emit(event, payload);
      }
    });
  });
}
