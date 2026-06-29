process.env.TZ = 'Asia/Kolkata';

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { connectDB } = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

connectDB();

app.use(cors());
app.use(express.json());

// Socket.io logic
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  // User online hua
  socket.on('join', (userId) => {
    onlineUsers.set(String(userId), socket.id);
  });

  // Message aaya
  socket.on('sendMessage', ({ receiverId, message, senderId, senderName }) => {
    const receiverSocket = onlineUsers.get(String(receiverId));
    if (receiverSocket) {
      io.to(receiverSocket).emit('newMessage', { senderId, senderName, message });
      io.to(receiverSocket).emit('unreadUpdate'); // Badge ke liye
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((sid, uid) => {
      if (sid === socket.id) onlineUsers.delete(uid);
    });
  });
});

// Make io accessible in controllers
app.set('io', io);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  res.json({ message: '✅ Barber Booking API Running!', serverTime: new Date().toLocaleString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});