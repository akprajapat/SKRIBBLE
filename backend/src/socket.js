import { Server } from 'socket.io';
import handleRoomEvents from './handlers/handleRoomEvents.js';
import handleGameEvents from './handlers/handleGameEvents.js';
import handleEventBus from './handlers/handleEventBus.js';

export default function attachSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  handleEventBus(io);

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Register event handlers
    handleRoomEvents(socket);
    handleGameEvents(socket);

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id} `);
    });
  });

  return io;
}

