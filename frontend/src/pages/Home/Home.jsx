import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";
import usernameGenerator from "../../utils/usernameGenerator"
import "./Home.css";
import Result from "../../features/Result/Result";

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
      <h1 className="Home__title">🎨 Scribble Game</h1>
      <div className="Home__section">
        <input className="Home__input"
          value={usernameInput}
          placeholder="Enter your name"
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <button className="Home__btn" onClick={joinPublicRoom}>Join Public Room</button>
      </div>
      <div className="Home__section">
        <input className="Home__input"
        value={roomId}
        placeholder="Enter Private Room ID"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button className="Home__btn" onClick={joinPrivateRoom}>Join Private Room</button>
      </div>
      <button className="Home__btn" onClick={createPrivateRoom}>Create Private Room</button>
    </div>
  );
}
