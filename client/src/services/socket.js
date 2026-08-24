import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to Agentflow server:', socket.id);
      
      // Auto-join user room if user is logged in
      const storedUser = localStorage.getItem('agentflow_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.id) {
            socket.emit('join_user', user.id);
          }
        } catch {
          // ignore
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join_execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave_execution', executionId);
  }
};
