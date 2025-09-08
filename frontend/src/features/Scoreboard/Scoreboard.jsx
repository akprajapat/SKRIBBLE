import "./Scoreboard.css";
import { useGame } from "../../context/GameContext";


export default function Scoreboard() {
  const {getScores} = useGame();
  const scores = getScores() || {};
  const ordered = Object.entries(scores).sort(([, a], [, b]) => b - a);
  console.log(scores,ordered)

  return (
    <div className="Scoreboard">
      <h4>Scoreboard</h4>
      <ul>
        {ordered.map(([name, score]) => (
          <li key={name}>
            <span className="Scoreboard__name">{name}</span>
            <span className="Scoreboard__score">{score ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
