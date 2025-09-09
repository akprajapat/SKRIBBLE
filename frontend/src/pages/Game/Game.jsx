import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";

import Topbar from "../../components/Topbar/Topbar";
import Canvas from "../../features/Canvas/Canvas";
import Chat from "../../components/Chat/Chat";
import Input from "../../components/Input/Input";

import PlayerList from "../../components/Playerlist/Playerlist";
import WordChoice from "../../features/WordChoice/WordChoice";
import Scoreboard from "../../features/Scoreboard/Scoreboard";

import "./Game.css";

export default function Game() {
  const socket = useSocket();
  const {
    getRoomId,
    getDrawerId,
    getPlayerId,
    phase,
  } = useGame();

  const roomId = getRoomId();
  const playerId = getPlayerId();
  const isDrawer = getDrawerId() === playerId;

  function getScreen() {
    if (phase === null || phase === "TURN") {
      return <Canvas isDrawer={isDrawer} roomId={roomId}/>;
    }
    if (phase === "WORD_SELECTION") {
      return <WordChoice />;
    }
    if (phase === "SCOREBOARD") {
      return <Scoreboard />;
    }
  }

  return (
    <div className="Game">
      <Topbar />
      <div className="Screen">
        {getScreen()}
      </div>
      <div className="player-chat-container">
        <PlayerList />
        <Chat />
      </div>
      <Input />
    </div>
  );
}
