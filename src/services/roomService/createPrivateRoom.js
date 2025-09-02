import RoomJoinTemplate from "./roomJoinTemplate.js";
import Room from "../../models/room.js";
import RoomType from "../../constants/roomType.js";

export default class CreatePrivateRoom extends RoomJoinTemplate {
  findRoom() {
    return null; // Always create a new private room
  }

  shouldCreateRoom() {
    return true;
  }

  createRoom(options) {
    return new Room({ type: RoomType.PRIVATE, ...options });
  }

  validateRoom() {
    return null; // No validation for new room
  }
}
