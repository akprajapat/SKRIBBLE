import "./Result.css";
import { useGame } from "../../context/GameContext";

export default function Result() {
  const { getResult } = useGame();
  const result = getResult() || [];
  const ordered = [...result].sort((a, b) => b.score - a.score);

  return (
    <div className="Result">
      <h4 className="Result__title">Result</h4>
      <ul className="Result__list">
        {ordered.map((p, index) => (
          <li key={p.id} className="Result__item">
            <span className="Result__rank">{index + 1}</span>
            <span className="Result__name">{p.name}</span>
            <span className="Result__score">{p.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
