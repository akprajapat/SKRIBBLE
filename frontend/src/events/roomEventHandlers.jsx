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
      players: payload.players,
      phase: payload.phase
    }));
  },

  WORD_SET: (payload, setGameState) =>
    setGameState((prev) => ({ ...prev, currentWord: payload.word })),

  TIMER_TICK: (payload, setGameState) => {
    console.log("TIMER_TICK event received:", payload);
    setGameState((prev) => ({ ...prev, timeLeft: payload.timeLeft, timerType: payload.type }));
  },

  CHAT: (payload, setGameState) => {
    console.log("CHAT event received:", payload);
    setGameState((prev) => ({ ...prev, messages: [...prev.messages, payload] }));
  },

  SCOREBOARD: (payload, setGameState) =>
    setGameState((prev) => ({ 
    ...prev,
    scores: payload.scores,
    currentWord: payload.word,
    round: payload.round,
    phase: payload.phase
   })),

  HINT_GENERATED: (payload, setGameState) =>
    setGameState((prev) => ({ ...prev, currentWord: payload.hint })),

  GAME_ENDED: (_, setGameState, resetGame) => resetGame(),
};

export default roomEventHandlers;