import "./Scoreboard.css";
import { useGame } from "../../context/GameContext";


export default function Scoreboard() {
  const {getScores} = useGame();
  const scores = getScores() || {};
  const ordered = Object.entries(scores).sort(([, a], [, b]) => b - a);
  console.log(scores,ordered)

  return (
    <div className="Scoreboard">
      <h4 className="Scoreboard__title">Scoreboard</h4>
      <ul className="Scoreboard__list">
        {ordered.map(([name, score]) => (
          <li key={name} className="Scoreboard__item">
            <span className="Scoreboard__name">{name}</span>
            <span className="Scoreboard__score">{score ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
