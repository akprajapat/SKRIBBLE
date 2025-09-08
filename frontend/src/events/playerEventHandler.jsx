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
};

export default playerEventHandlers;