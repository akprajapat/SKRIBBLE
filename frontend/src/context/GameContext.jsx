import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { gameEventBus } from "../events/gameEventBus"
import roomEventHandlers from "../events/roomEventHandlers";
import playerEventHandlers from "../events/playerEventHandler";

const GameContext = createContext();


export function GameProvider({ children }) {
  const socket = useSocket();

  const [gameState, setGameState] = useState({
    roomId: null,
    playerId: null,
    username: null,
    players: [],
    messages: [],
    drawerId: null,
    currentWord: "",
    round: 1,
    totalRounds: 3,
    timer: 60,
    scores: {},
    started: false,
    wordChoices: [],
    phase: null,
  });

  // ---------------- SETTERS ----------------
  const setRoomInfo = ({ roomId, playerId, players, totalRounds }) => {
    setGameState((prev) => ({
      ...prev,
      roomId,
      playerId,
      players: players || prev.players,
      totalRounds: totalRounds || prev.totalRounds,
    }));
  };

  const setUsername = (username) => {
    setGameState((prev) => ({ ...prev, username }));
  };

  const resetGame = () => {
    setGameState({
      roomId: null,
      playerId: null,
      username: null,
      players: [],
      messages: [],
      drawerId: null,
      currentWord: "",
      round: 1,
      totalRounds: 3,
      timeLeft: 60,
      wordChoices: [],
      phase: null,
    });
  };

  // ---------------- SOCKET BINDING ----------------
  useEffect(() => {
    if (!socket) return;

    const roomEvents = Object.keys(roomEventHandlers);
    const playerEvents = Object.keys(playerEventHandlers);

    [...roomEvents, ...playerEvents].forEach((event) => {
      socket.on(event, (payload) => {
        gameEventBus.emit(event, payload);
      });
    });

    return () => {
      [...roomEvents, ...playerEvents].forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket]);

  // ✅ Bind event bus to actual handlers
  useEffect(() => {
    const roomEvents = Object.entries(roomEventHandlers);
    const playerEvents = Object.entries(playerEventHandlers);

    roomEvents.forEach(([event, handler]) => {
      gameEventBus.on(event, (payload) => handler(payload, setGameState, resetGame));
    });

    playerEvents.forEach(([event, handler]) => {
      gameEventBus.on(event, (payload) => handler(payload, setGameState));
    });

    return () => {
      roomEvents.forEach(([event]) => gameEventBus.off(event));
      playerEvents.forEach(([event]) => gameEventBus.off(event));
    };
  }, []);

  // ---------------- GETTERS ----------------
  const getRoomId = () => gameState.roomId;
  const getPlayerId = () => gameState.playerId;
  const getUsername = () => gameState.username;
  const getPlayers = () => gameState.players;
  const getMessages = () => gameState.messages;
  const getDrawerId = () => gameState.drawerId;
  const getCurrentWord = () => gameState.currentWord;
  const getRound = () => gameState.round;
  const getTotalRounds = () => gameState.totalRounds;
  const getTimeLeft = () => gameState.timeLeft;
  const getWordChoices = () => gameState.wordChoices;
  const getPhase = () => gameState.phase;
  const getScores = () => gameState.scores;

  return (
    <GameContext.Provider
      value={{
        gameState,
        setRoomInfo,
        setUsername,
        resetGame,

        getRoomId,
        getPlayerId,
        getUsername,
        getPlayers,
        getMessages,
        getDrawerId,
        getCurrentWord,
        getRound,
        getTotalRounds,
        getTimeLeft,
        getWordChoices,
        getPhase,
        getScores
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);