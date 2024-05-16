const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;
const mongoose = require("mongoose");

const DicecountModel = require("./models/dicecountModel");

const connectionMongoDB = require("./connectionMongoDB");
connectionMongoDB();

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`);

  socket.on("rollDice", async (data) => {
    const diceResult = Math.floor(Math.random() * 6) + 1;
    io.emit("diceRolled", { user: data.user, result: diceResult });

    // Save to MongoDB
    try {
      const dicecountInfo = new DicecountModel({
        user: data.user,
        dicecount: diceResult,
        dicecountSum: diceResult,
      });
      await dicecountInfo.save();
      console.log("Dice roll saved to MongoDB.", diceResult);
    } catch (error) {
      console.error("Error saving dice roll to MongoDB: ", error);
    }
  });

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
