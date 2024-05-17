const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;
const mongoose = require("mongoose");

const messageModel = require("./models/messageModel");
const dicecountModel = require("./models/dicecountModel");

const connectionMongoDB = require("./connectionMongoDB");
connectionMongoDB();

app.use(express.static("public"));

// Endpoint to messages
app.get("/messages", async (req, res) => {
  try {
    const allMessages = await messageModel.find();
    return res.status(200).json(allMessages);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// Endpoint to dicerolls
app.get("/dicerolls", async (req, res) => {
  try {
    const allDicecount = await dicecountModel.find();
    return res.status(200).json(allDicecount);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

io.on("connection", (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`);

  socket.on("chatMessage", async (msg) => {
    try {
      const { user, message, inputColor, date } = msg; // Plocka ut fälten från meddelandeobjektet
      // Spara meddelandet till MongoDB inklusive datumet

      const newMessage = new messageModel({
        user: user,
        message: message,
        inputColor: inputColor, // Inkludera inputColor i meddelandeobjektet
        date: date, // Inkludera datumet från meddelandeobjektet
      });
      await newMessage.save(); // Spara meddelandet till databasen
      io.emit("newChatMessage", {
        user: user,
        message: message,
        inputColor: inputColor, // Inkludera inputColor i det sända meddelandet
        date: date, // Inkludera datumet i det sända meddelandet
      });
    } catch (error) {
      console.error("Error saving message to MongoDB: ", error);
    }
  });
  socket.on("rollDice", async (data) => {
    const diceResult = Math.floor(Math.random() * 6) + 1;
    io.emit("diceRolled", { user: data.user, result: diceResult });

    // Spara till MongoDB
    try {
      const dicecountInfo = new dicecountModel({
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

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected!`);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO Server running at http://localhost:${port}/`);
});
