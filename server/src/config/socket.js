const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific workflow execution
    socket.on('join_execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`[Socket.IO] ${socket.id} joined execution:${executionId}`);
      }
    });

    // Leave execution room
    socket.on('leave_execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    // Join room for user notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] ${socket.id} joined user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Socket instance requested before initialization.');
  }
  return io;
};

const emitToExecution = (executionId, event, data) => {
  if (io) {
    io.to(`execution:${executionId}`).emit(event, data);
    // Also emit globally for dashboards listening to general updates
    io.emit('execution_update', { executionId, event, data });
  }
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const broadcastNotification = (notification) => {
  if (io) {
    if (notification.owner) {
      io.to(`user:${notification.owner}`).emit('notification', notification);
    } else {
      io.emit('notification', notification);
    }
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToExecution,
  emitToUser,
  broadcastNotification,
};
