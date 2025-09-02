import React, { useEffect, useRef, useState } from "react";
import "./Chat.css";
import { useGame } from "../../context/GameContext";
import { useSocket } from "../../context/SocketContext";

export default function Chat() {
  const { gameState } = useGame();
  const socket = useSocket();
  const [msg, setMsg] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [gameState.messages]);

  const onSend = (e) => {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;

    socket.emit("guessWord", {
      roomId: gameState.roomId,
      playerId: gameState.playerId,
      guess: text
    });

    socket.emit("chat", {
      roomId: gameState.roomId,
      username: gameState.username,
      message: text
    });

    setMsg("");
  };

  return (
    <div className="Chat">
      <div className="Chat__list" ref={listRef}>
        {gameState.messages.map((m, i) => (
          <div className="Chat__item" key={i}>
            <span className="Chat__user">{m.username}:</span>
            <span className="Chat__text">{m.message}</span>
          </div>
        ))}
      </div>
      <form className="Chat__form" onSubmit={onSend}>
        <input
          className="Chat__input"
          placeholder="Type to chat / guess..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button className="Chat__send" type="submit">Send</button>
      </form>
    </div>
  );
}
