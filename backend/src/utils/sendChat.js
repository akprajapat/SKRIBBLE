import eventBus from "../events/eventBus.js";

function sendChat({roomId=null, system = false, userId = null, message, }) {
  if (system) {
    eventBus.emit("CHAT",  roomId,{ message: { system: true, text: message } });
  } else {
    eventBus.emit("CHAT", roomId,{ message: { userId, text: message } });
  }
}

export default sendChat;
