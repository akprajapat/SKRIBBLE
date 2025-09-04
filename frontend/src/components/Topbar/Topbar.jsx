import "./Topbar.css";
import Timer from "../Timer/Timer"
import { useGame } from "../../context/GameContext";


export default function Topbar() {
  const { getRound, getTotalRounds, getWord, getTimeLeft } = useGame();

  return (
    <header className="Topbar">
      <div className="Topbar__round">
        Round: {getRound()} / {getTotalRounds()}
      </div>
      <div className="Topbar__word">
         word : {getWord()}
      </div>
      <Timer timeLeft={getTimeLeft()} /> 
    </header>
  );
}

