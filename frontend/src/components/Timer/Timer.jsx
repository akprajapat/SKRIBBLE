import "./Timer.css";
import { useGame } from "../../context/GameContext";

export default function Timer() {
  const { getTimeLeft } = useGame();
  const timeLeft = getTimeLeft();

  return (
    <div className="Timer">
      ⏳:<b>  {timeLeft} s</b>
    </div>
  );
}
