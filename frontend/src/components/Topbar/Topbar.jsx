import "./Topbar.css";
import Timer from "../Timer/Timer"

export default function Topbar({ round, totalRounds, word, timeLeft }) {
  return (
    <header className="Topbar">
      <div className="Topbar__round">
        Round: {round} / {totalRounds}
      </div>
      <div className="Topbar__word">
         word : {word}
      </div>
      <Timer timeLeft={timeLeft} /> 

    </header>
  );
}
