import http from 'http';
import app from './app.js';
import attachSocket from './socket.js';

const server = http.createServer(app);
const io = attachSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on ${PORT}`);
});
