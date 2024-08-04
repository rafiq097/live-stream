require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

const server = http.createServer(app);

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
// });

const io = new Server(8000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 8000;

const usernameToSocketIdMap = new Map();
const socketidTousernameMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on("room:join", (data) => {
    const { username, room } = data;
    usernameToSocketIdMap.set(username, socket.id);
    socketidTousernameMap.set(socket.id, username);
    io.to(room).emit("user:joined", { username, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // Add chat message handling
  socket.on("chat:message", ({ to, message }) => {
    console.log(`Message from ${socket.id} to ${to}: ${message}`);
    io.to(to).emit("chat:message", { from: socket.id, message });
  });

  socket.on("disconnect", () => {
    console.log(`Socket Disconnected`, socket.id);
    const username = socketidTousernameMap.get(socket.id);
    if (username) {
      usernameToSocketIdMap.delete(username);
      socketidTousernameMap.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io server running on port ${PORT}`);
});