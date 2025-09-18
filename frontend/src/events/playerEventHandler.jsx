
const playerEventHandlers = {
  WORD_CHOICES: (payload, setGameState) => {
    console.log("WORD_CHOICES event received:", payload);
    setGameState((prev) => ({ 
    ...prev,
    wordChoices: payload.wordChoices,
    phase: payload.phase
    }));
  },

  CORRECT_GUESS: (payload, setGameState) => {
    // optional: handle correct guess
  },

  GAME_STATE: (payload,setGameState) => {
    console.log("GAME_STATE event received:", payload);
    setGameState((prev) => ({ 
    ...prev,
    roomId: payload.roomId,
    round: payload.round,
    timeLeft: payload.timeLeft,
    type: payload.type,
    phase: payload.phase,
    word: payload.word,
    started: payload.started,
    players: payload.players,
    drawerId: payload.drawerId,
    }));
  }
};

export default playerEventHandlers;