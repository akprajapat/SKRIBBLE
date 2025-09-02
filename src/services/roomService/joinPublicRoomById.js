import RoomJoinTemplate from "./roomJoinTemplate.js";
import RoomType from "../../constants/roomType.js";

export default class JoinPublicRoomById extends RoomJoinTemplate {
  findRoom(roomId) {
    return this.rooms.get(roomId);
  }

  validateRoom(room) {
    if (!room) return "Room not found";
    if (room.type !== RoomType.PUBLIC) return "Not a public room";
    if (room.isFull()) return "Room is full";
    return null;
  }
}
