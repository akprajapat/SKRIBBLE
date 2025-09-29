
const playerEventHandlers = {
  WORD_CHOICES: (payload, setGameState) => {
    console.log("WORD_CHOICES event received:", payload);
    setGameState((prev) => ({ 
    ...prev,
    wordChoices: payload.wordChoices,
    }));
  },

  CORRECT_GUESS: (payload, setGameState) => {
    // optional: handle correct guess
  },

  GAME_STATE: (payload,setGameState, setPhase) => {
    console.log("GAME_STATE event received:", payload);
    setGameState((prev) => ({ 
    ...prev,
    roomId: payload.roomId,
    round: payload.round,
    timeLeft: payload.timeLeft,
    type: payload.type,
    currentWord: payload.word,
    started: payload.started,
    players: payload.players,
    drawerId: payload.drawerId,
    image: payload.image,
    }));
    setPhase(payload.phase);
  }
};

export default playerEventHandlers;