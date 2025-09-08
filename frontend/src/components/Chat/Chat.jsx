import React, { useEffect, useRef } from "react";
import "./Chat.css";
import { useGame } from "../../context/GameContext";
/*
getMessages -> [msg]
msg : {system: true/false, text: "this is real message that will be shown", color: "red", username: if not system }
 */

export default function Chat() {
  const { getMessages } = useGame();
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [getMessages]);

  return (
    <div className="Chat">
      <div className="Chat__list" ref={listRef}>
        {getMessages().map((m, i) => (
          <div className="Chat__item" key={i}>
          <script> console.log(m,i) </script> 
            { m.system ? <></> : <span className="Chat__user">{m.username}:</span>}
            <span className="Chat__text">{m.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
