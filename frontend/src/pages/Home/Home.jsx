import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";
import usernameGenerator from "../../utils/usernameGenerator"
import WordChoice from "../../features/WordChoice/WordChoice";
import Scoreboard from "../../features/Scoreboard/Scoreboard";

export default function Home() {
  const [usernameInput, setUsernameInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();
  const { setUsername, setRoomInfo, getRoomId  } = useGame();

  const getFinalUsername = () => {
    if (usernameInput.trim() !== "")
      return usernameInput.trim();
    return usernameGenerator();
  };

  function joinPublicRoom() {
    const finalUsername = getFinalUsername();
    socket.emit("joinPublicRoom", { username: finalUsername }, ({ roomId, playerId, error }) => {
      if (error) return alert(error);
      setUsername(finalUsername);
      setRoomInfo({ roomId, playerId });
      navigate(`/${roomId}`);
    });
  }

  function createPrivateRoom() {
    const finalUsername = getFinalUsername();
    socket.emit("createPrivateRoom", { username: finalUsername }, ({ roomId, playerId, error }) => {
      if (error) return alert(error);
      setUsername(finalUsername);
      console.log({ roomId, playerId })
      setRoomInfo({ roomId, playerId });
      navigate(`/private-room`);
    });
  }

  function joinPrivateRoom() {
    const finalUsername = getFinalUsername();
    socket.emit("joinPrivateRoom", { roomId, username: finalUsername }, ({ success, playerId, error }) => {
      if (error || !success) {
        alert(error || "Room not found or full");
        return;
      }
      setUsername(finalUsername);
      setRoomInfo({ roomId, playerId });
      navigate(`/${roomId}`);
    });
  }

  return (
    <div className="Home">
      <h1>🎨 Scribble Game</h1>
      <input
        value={usernameInput}
        placeholder="Enter your name"
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <div>
        <button onClick={joinPublicRoom}>Join Public Room</button>
        <button onClick={createPrivateRoom}>Create Private Room</button>
      </div>
      <input
        value={roomId}
        placeholder="Enter Private Room ID"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinPrivateRoom}>Join Private Room</button>
    </div>
  );
}
