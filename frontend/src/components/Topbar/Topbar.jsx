import "./Topbar.css";
import Timer from "../Timer/Timer";
import { useGame } from "../../context/GameContext";

export default function Topbar({isDrawer}) {
  const { getRound, getTotalRounds, getCurrentWord, getSelectedWord } = useGame(); 
  const word = isDrawer ? getSelectedWord() : getCurrentWord();
  console.log("Topbar rendered", isDrawer, getSelectedWord(), getCurrentWord(),word);

  return (
    <header className="Topbar">
      <div className="Topbar__timer">
        <Timer/>
      </div>
      <div className="Topbar__word">
        {word.split("").map((ch, i) => (
          <span key={i} className="Topbar__letter">
            {ch === "_" ? "_" : ch}
          </span>
        ))}
        <span className="Topbar__word-length">{word.length}</span>
      </div>
      <div className="Topbar__round">
        Round {getRound()} / {getTotalRounds()}
      </div>
    </header>
  );
}
