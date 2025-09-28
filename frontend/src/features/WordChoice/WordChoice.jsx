import "./WordChoice.css";
import { useSocket } from "../../context/SocketContext";
import { useGame } from "../../context/GameContext";

export default function WordChoice() {
  const socket = useSocket();
  const { getWordChoices, getRoomId, getPlayerId, getDrawerId, getPlayerNameById, setSelectedWord } = useGame();
  const isDrawer = getDrawerId() === getPlayerId();
  console.log(isDrawer,getDrawerId(),getPlayerNameById(getDrawerId()))

  if (!isDrawer) {
    return (
    <div className="WordChoice">
      <h3 className="WordChoice__title">{getPlayerNameById(getDrawerId())} is choosing a word</h3>
    </div>
    )
  }
    
  const select = (word) => {
    setSelectedWord(word);
    socket.emit(
      "SELECTED_WORD",
      { roomId: getRoomId(), playerId: getPlayerId(), word },
      (res) => {
        if (res?.error) alert(res.error);
      }
    );
  };
  const wordChoices = getWordChoices();
  return (
    <div className="WordChoice">
      <h3 className="WordChoice__title">Choose a word</h3>
      <div className="WordChoice__grid">
        {wordChoices.map((w) => (
          <button key={w} className="WordChoice__btn" onClick={() => select(w)}>
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
