import React from "react";
import "./Scoreboard.css";

export default function Scoreboard({ scores = [] }) {
  if (!scores?.length) return null;

  const ordered = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="Scoreboard">
      <h4>Scoreboard</h4>
      <ul>
        {ordered.map((s) => (
          <li key={s.id}>
            <span className="Scoreboard__name">{s.name}</span>
            <span className="Scoreboard__score">{s.score ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
