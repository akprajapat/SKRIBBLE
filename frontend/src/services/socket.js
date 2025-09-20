import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost";
const PORT = import.meta.env.VITE_SOCKET_PORT || "4000";

const socket = io(`${URL}:${PORT}`);

export default socket;
