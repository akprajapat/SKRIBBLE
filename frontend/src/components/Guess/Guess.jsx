import React, { useState } from "react";
import "./Guess.css";
import { useGame } from "../../context/GameContext";
import { guessWordEvent } from "../../services/emitGameEvents";

export default function Guess() {
  const { getRoomId, getPlayerId } = useGame();
  const [msg, setMsg] = useState("");

  const onSend = (e) => {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;
    guessWordEvent( getRoomId(),getPlayerId(), text);
    setMsg("");
  };

  return (
    <div>
      <form className="Guess__form" onSubmit={onSend}>
        <input
          className="Guess__field"
          placeholder="Type to chat / guess..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <span className="Guess__length">{msg.length}</span>
        <button className="Guess__send" type="submit">Send</button>
      </form>
    </div>
  );
}
