import { io } from "socket.io-client";

const URL = "http://localhost:4000"; // backend
const socket = io(URL);

export default socket;
