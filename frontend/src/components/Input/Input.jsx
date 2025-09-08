import React, { useState } from "react";
import "./Input.css";
import { useGame } from "../../context/GameContext";
import { guessWordEvent } from "../../services/emitGameEvents";

export default function Input() {
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
    <div className="Input">
      <form className="Input__form" onSubmit={onSend}>
        <input
          className="Input__field"
          placeholder="Type to chat / guess..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <span className="Input__length">{msg.length}</span>
        <button className="Input__send" type="submit">Send</button>
      </form>
    </div>
  );
}
