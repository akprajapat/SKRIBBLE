import RoomJoinTemplate from "./roomJoinTemplate.js";
import Room from "../../models/room.js";
import RoomType from "../../constants/roomType.js";

export default class JoinPublicRoom extends RoomJoinTemplate {
  findRoom(roomId) {
    return [...this.rooms.values()].find(r => r.type === RoomType.PUBLIC && !r.isFull());
  }

  shouldCreateRoom() {
    return true;
  }

  createRoom(options) {
    return new Room({ type: RoomType.PUBLIC, ...options });
  }

  validateRoom(room) {
    if (!room) return "No available public room";
    return null;
  }
}
