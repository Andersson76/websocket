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
      const { user, message, inputColor } = msg; // Plocka ut fälten från meddelandeobjektet
      // Spara meddelandet till MongoDB inklusive datumet

      let today = new Date();
      let date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      let time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let dateTime = date + " " + time;

      const newMessage = new messageModel({
        user: user,
        message: message,
        inputColor: inputColor, // Inkludera inputColor i meddelandeobjektet
        date: dateTime, // Inkludera datumet från meddelandeobjektet
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
    try {
      const userDiceData = await dicecountModel.findOne({ user: data.user });
      let newSum = diceResult;

      if (userDiceData) {
        newSum += userDiceData.dicecountSum;
        userDiceData.dicecountSum = newSum;
        userDiceData.dicecount = diceResult;
        await userDiceData.save();
      } else {
        const dicecountInfo = new dicecountModel({
          user: data.user,
          dicecount: diceResult,
          dicecountSum: newSum,
        });
        await dicecountInfo.save();
      }

      io.emit("diceRolled", {
        user: data.user,
        result: diceResult,
        total: newSum,
      });
      console.log(
        "Dice roll saved to MongoDB.",
        diceResult,
        "New sum:",
        newSum
      );
    } catch (error) {
      console.error("Error saving dice roll to MongoDB: ", error);
    }
  });

  socket.on("resetGame", async (data) => {
    try {
      await dicecountModel.updateOne({ user: data.user }, { dicecountSum: 0 });
      io.emit("gameReset", data.user);
      console.log(`Game reset for user: ${data.user}`);
    } catch (error) {
      console.error("Error resetting game: ", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected!`);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO Server running at http://localhost:${port}/`);
});
