import React from "react";
import "./WordChoice.css";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";

export default function WordChoice({ choices = [] }) {
  const socket = useSocket();
  const { gameState } = useGame();

  const select = (word) => {
    socket.emit(
      "selectWord",
      { roomId: gameState.roomId, playerId: gameState.playerId, word },
      (res) => {
        if (res?.error) alert(res.error);
      }
    );
  };

  return (
    <div className="WordChoice">
      <h3>Choose a word</h3>
      <div className="WordChoice__grid">
        {choices.map((w) => (
          <button key={w} className="WordChoice__btn" onClick={() => select(w)}>
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
