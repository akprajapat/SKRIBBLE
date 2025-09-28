import Difficulty from "./difficulty.js"
import RoomType from "./roomType.js";

const PUBLIC_ROOM = {
  type: RoomType.PUBLIC,
  maxPlayers: 8,
  totalRounds: 3,
  turnSeconds: 45,
  difficulty: Difficulty.MEDIUM,
};

export default PUBLIC_ROOM;