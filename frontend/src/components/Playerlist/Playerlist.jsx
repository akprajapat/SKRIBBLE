import "./Playerlist.css";
import { useGame } from "../../context/GameContext";

export default function PlayerList() {
  const { getPlayers, getDrawerId, getPlayerId, gameState } = useGame();
  const players = getPlayers();
  console.log("Players in the game:", players, getPlayerId(), gameState);
  const drawerId = getDrawerId();
  const playerId = getPlayerId();
  return (
    <div className="PlayerList">
      {players.map((player, index) => {
        const isDrawer = drawerId === player.id;
        const isCurrentUser = playerId === player.id;

        return (
          <div className="PlayerList__item" key={player.id}>
            <span className="PlayerList__rank">#{player.rank}</span>
            <span className="PlayerList__score">{player.score}</span>
            <span className="PlayerList__name">{player.name}
              {isCurrentUser && <span className="PlayerList__you">(You)</span>}
              {isDrawer && <span className="PlayerList__drawer">✏️</span>}
            </span>
            
          </div>
        );
      })}
    </div>
  );
}
