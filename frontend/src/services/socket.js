import { io } from 'socket.io-client';

// Local dev ke liye localhost, production ke liye Railway URL
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'], // polling se start karo, websocket pe upgrade hoga
  });

  socket.on('connect', () => {
    socket.emit('join', userId);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};