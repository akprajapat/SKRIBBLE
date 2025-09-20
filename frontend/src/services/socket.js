import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

console.log("Connecting to Socket.IO server at:", URL);

const socket = io(URL);

export default socket;
