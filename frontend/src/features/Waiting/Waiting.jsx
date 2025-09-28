import "./Waiting.css";
import { useGame } from "../../context/GameContext";
import { useEffect } from "react";

export default function Waiting() {
  const { getStarted } = useGame();

  useEffect(() => {
    console.log("Rendering Waiting component, game started:", getStarted());
  }, [getStarted]);

  const gameStarted = getStarted();

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
    
  