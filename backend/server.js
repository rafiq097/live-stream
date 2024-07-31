const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const app = express();
const io = new Server();
app.use(bodyParser.json());

const emailMapping = new Map();

io.on('connection', (socket) => {
    socket.on("join-room", (data) => {
        const { roomId, emailId } = data;
        console.log(`User: ${emailId} joined room: ${roomId}`);
        emailMapping.set(emailId, socket.id);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("User Joined ", { emailId });
    })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
io.listen(3001);