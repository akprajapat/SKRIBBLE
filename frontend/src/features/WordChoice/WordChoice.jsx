import React from "react";
import "./WordChoice.css";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";

export default function WordChoice() {
  const socket = useSocket();
  const { getWordChoices, getRoomId, getPlayerId} = useGame();

  const select = (word) => {
    socket.emit(
      "SELECTED_WORD",
      { roomId: getRoomId(), playerId: getPlayerId(), word },
      (res) => {
        if (res?.error) alert(res.error);
      }
    );
  };

  const wordChoices = getWordChoices();
  return (
    <div className="WordChoice">
      <h3>Choose a word</h3>
      <div className="WordChoice__grid">
        {wordChoices.map((w) => (
          <button key={w} className="WordChoice__btn" onClick={() => select(w)}>
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
