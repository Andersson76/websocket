const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

app.use(express.static("public"));


io.on("connection", (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`);

  socket.on("chatMessage", (msg) => {
    io.emit("newChatMessage", {
      user: msg.user,
      message: msg.message,
      inputColor: msg.inputColor,
    });
  });
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected!`);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO Server running at http://localhost:${port}/`);
});
