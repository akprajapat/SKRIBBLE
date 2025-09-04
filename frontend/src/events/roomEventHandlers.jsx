const roomEventHandlers = {
  GAME_STARTED: (payload, setGameState) => {
    setGameState((prev) => ({
      ...prev,
      started: true,
      players: payload.players,
      roomId: payload.roomId
    }));
  },

  ROUND_STARTED: (payload, setGameState) => {
    setGameState((prev) => ({
      ...prev,
      round: payload.round,
      drawerId: payload.drawerId,
      wordChoices: [],
      currentWord: null,
      hints: [],
      timer: 60
    }));
  },

  WORD_SET: (payload, setGameState) =>
    setGameState((prev) => ({ ...prev, currentWord: payload.word })),

  TIMER_TICK: (payload, setGameState) => {
    console.log("TIMER_TICK event received:", payload);
    setGameState((prev) => ({ ...prev, timer: payload.timeLeft }));
  },

  CHAT: (payload, setGameState) => {
    console.log("CHAT event received:", payload);
    setGameState((prev) => ({ ...prev, messages: [...prev.messages, payload] }));
  },

  SCOREBOARD: (payload, setGameState) =>
    setGameState((prev) => ({ ...prev, scores: payload.scores })),

  HINT_GENERATED: (payload, setGameState) =>
    setGameState((prev) => ({ ...prev, hints: [...prev.hints, payload.hint] })),

  GAME_ENDED: (_, setGameState, resetGame) => resetGame(),
};

export default roomEventHandlers;