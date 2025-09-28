import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";
import { useParams, useNavigate, useLocation,  useNavigationType } from "react-router-dom";

import Topbar from "../../components/Topbar/Topbar";
import Canvas from "../../features/Canvas/Canvas";
import Chat from "../../components/Chat/Chat";
import Guess from "../../components/Guess/Guess";

import PlayerList from "../../components/Playerlist/Playerlist";
import WordChoice from "../../features/WordChoice/WordChoice";
import Scoreboard from "../../features/Scoreboard/Scoreboard";
import Result from "../../features/Result/Result";
import Waiting from "../../features/Waiting/Waiting";

import "./Game.css";

export default function Game() {
  const socket = useSocket();
  const {
    getRoomId,
    getDrawerId,
    getPlayerId,
    resetGame,
    getStarted,
    phase,
    gameState,
  } = useGame();

  const { roomId } = useParams();
  const navigate = useNavigate();
  const playerId = getPlayerId();
  const isDrawer = getDrawerId() === playerId;
  const isMounted = useRef(0);

  useEffect(() => {
    // Validate direct access to the roomId
    console.log("Validating room...", roomId, getRoomId());
    if (roomId !== getRoomId()) {
      navigate('/');
    }
  }, [roomId, navigate]);

  useEffect(() => {
    return () => {
      console.log("isMount ",isMounted.current);
      if (isMounted.current > 4) {
        socket.emit("PLAYER_LEAVE", { roomId, playerId });
        resetGame();
      }
    }
  }, [socket]);

  isMounted.current++;

  function getScreen() {
    if (phase === null) {
      return <Waiting />;
    }
    if (phase === "TURN") {
      return <Canvas isDrawer={isDrawer} roomId={roomId}/>;
    }
    if (phase === "WORD_SELECTION") {
      return <WordChoice />;
    }
    if (phase === "SCOREBOARD") {
      return <Scoreboard />;
    }
    if (phase === "GAME_ENDED") {
      return <Result />;
    }
  }


  return (
    <div className="Game">
      <Topbar isDrawer={isDrawer} />
      <div className="Screen">
        {getScreen()}
      </div>
      <div className="player-chat-container">
        <PlayerList />
        <Chat />
      </div>
      <Guess />
    </div>
  );
}
