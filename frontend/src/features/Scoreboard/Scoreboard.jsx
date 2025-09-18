import "./Scoreboard.css";
import { useGame } from "../../context/GameContext";

export default function Scoreboard() {
  const { getScores, getPlayerNameById, getPlayers } = useGame();
  const scores = getScores() || {};
  const ordered = Object.entries(scores).sort(([, a], [, b]) => b - a);
  console.log(getPlayers());

  return (
    <div className="Scoreboard">
      <h4 className="Scoreboard__title">Scoreboard</h4>
      <ul className="Scoreboard__list">
        {ordered.map(([id, score]) => (
          <li key={id} className="Scoreboard__item">
            {console.log(id, score, getPlayerNameById(id))}
            <span className="Scoreboard__name">{getPlayerNameById(id)}</span>
            <span className="Scoreboard__score">{score ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
