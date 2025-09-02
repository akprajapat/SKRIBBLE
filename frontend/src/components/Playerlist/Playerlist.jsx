import "./Playerlist.css";
import { useGame } from "../../context/GameContext";

export default function PlayerList() {
  const { getPlayers, getDrawerId } = useGame();
  const players = getPlayers();
  const drawerId = getDrawerId();
  return (
    <div className="PlayerList">
      {players.map((player, index) => {
        const isDrawer = drawerId === player.id;

        return (
          <div className="PlayerList__item" key={player.id}>
            <span className="PlayerList__rank">#{player.rank}</span>
            <span className="PlayerList__name">{player.name}</span>
            <span className="PlayerList__score">{player.score}</span>
            {isDrawer && <span className="PlayerList__drawer">✏️</span>}
          </div>
        );
      })}
    </div>
  );
}
