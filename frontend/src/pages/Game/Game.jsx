import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";

import Topbar from "../../components/Topbar/Topbar";
import Canvas from "../../features/Canvas/Canvas";
import Chat from "../../components/Chat/Chat";
import PlayerList from "../../components/Playerlist/Playerlist";
import WordChoice from "../../features/WordChoice/WordChoice";
import Scoreboard from "../../features/Scoreboard/Scoreboard";

import "./Game.css";

export default function Game() {
  const socket = useSocket();
  const {
    getRoomId,
    getPlayers,
    getWordChoices,
    getScores,
    getDrawerId,
    getPlayerId,
    getRound,
    getTotalRounds,
    getCurrentWord,
    getTimer
  } = useGame();

  const roomId = getRoomId();
  const playerId = getPlayerId();
  const isDrawer = getDrawerId() === playerId;

  useEffect(() => {
    console.log("Socket connected:", socket);
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  }, [socket]);

  return (
    <div className="Game">
      <div className="Topbar-container">
        <Topbar />
      </div>
      <div className="Canvas-container">
        {/* {getWordChoices()?.length > 0 ? (
          <WordChoice choices={getWordChoices()} />
        ) : (
        )} */}
          <Canvas roomId={getRoomId()} isDrawer={isDrawer} />
      </div>
      <div className="player-chat-container">
        <PlayerList players={getPlayers()} />
        <Chat />
      </div>
    </div> 
  );
}
