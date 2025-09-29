import "./Waiting.css";
import { useGame } from "../../context/GameContext";
import { useEffect } from "react";

export default function Waiting() {
  const { getStarted } = useGame();
  let gameStarted = getStarted();

  useEffect(() => {
    gameStarted = getStarted();
  }, [getStarted]);

  return (
    <div className="Waiting">
        {gameStarted ? (
          <h3 className="Waiting__title">Game is starting.....</h3>
        ) : (
          <h3 className="Waiting__title">Waiting for other players to join.....</h3>
        )}
    </div>
    );
}
    
  