const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

let onlineUsers = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// the Socket Io for a online logic

io.on("connection", (socket) => {

  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId: socket.id });

    io.emit("getOnlineUsers", onlineUsers);
    console.log(onlineUsers);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    io.emit("getOnlineUsers", onlineUsers);
  });

  // socket.on("send_message", ( message ) => {
  //   const users = onlineUsers.find(user => user.userId !== message.recipientId)
  //   // socket.emit("receive_message", message);
  //   if (users) {
  //     io.to(users.socketId).emit("receive_message", message);
  //   }
  //   console.log(message, users);
  // });
});

server.listen(3001, () => {
  console.log("Server is runing ");
});
