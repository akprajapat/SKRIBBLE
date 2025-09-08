import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import socket from "../../services/socket";
import Playerlist from "../../components/Playerlist/Playerlist";
import Dropdown from "../../components/Dropdown/Dropdown";
import Chat from "../../components/Chat/Chat";

import "./PrivateRoom.css";

export default function PrivateRoom() {
  const navigate = useNavigate();
  const { getPlayerId, getRoomId } = useGame();
  const [rounds, setRounds] = useState(3);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [difficulty, setDifficulty] = useState("Medium");
  const [timer, setTimer] = useState(60);

  function startGame() {
    const roomId = getRoomId();
    const playerId = getPlayerId();
    console.log(`${roomId}, ${playerId}, ${rounds}, ${maxPlayers}, ${difficulty}, ${timer}`)
    socket.emit(
      "startGameHost",
      {  roomId, playerId, rounds, maxPlayers, difficulty, timer },
      (response) => {
        if (response.error) {
          console.error("Game start failed:", response.error);
        } else {
          navigate(`/${response.roomId}`);
        }
      }
    );
  }

  return (
    <div className="private-room">
      <div className="dropdowns">
          < Dropdown 
            label="Rounds"
            options={[2, 3, 4, 5]}
            defaultValue={rounds}
            onSelect={(e) => setRounds(Number(e))}
          />
          < Dropdown
            label="Players"
            options={[2, 3, 4, 5, 6, 8, 10, 12, 15]}
            defaultValue={maxPlayers}
            onSelect={(e) => setMaxPlayers(Number(e))}
          />
          < Dropdown
            label="Difficulty"
            options={["Easy", "Medium", "Hard"]}
            defaultValue={difficulty}
            onSelect={(e) => setDifficulty(e)}
          />
          < Dropdown
            label="Timer(s)"
            options={[30, 45, 60, 80, 90, 120]}
            defaultValue={timer}
            onSelect={(e) => setTimer(Number(e))}
          />
      </div>

      <button className="start-btn" onClick={startGame}>
        Start Game
      </button>

      <div className="player-chat-container">
        <Playerlist />
        <Chat />
      </div>
    </div>
  );
}
