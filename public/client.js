const socket = io();

const formUser = document.querySelector("#formUser");
const inputUser = document.querySelector("#inputUser");
const inputColor = document.querySelector("#inputColor");
const messages = document.querySelector("#messages");
const formMessage = document.querySelector("#formMessage");
const inputMessage = document.querySelector("#inputMessage");
const userContainer = document.querySelector("#userContainer");
const throwDice = document.querySelector("#throwDice");
const diceCounts = document.querySelector("#diceCounts");
const totalDisplays = document.querySelector("#totalDisplays");

let myUser;
let myInputColor;
let totals = {}; // Objekt för att lagra totalen för varje spelare

throwDice.addEventListener("click", () => {
  let random = Math.floor(Math.random() * 6 + 1);
  socket.emit("rollDice", { user: myUser, result: random });
});

socket.on("diceRolled", (data) => {
  let diceroll = document.createElement("li");
  diceroll.textContent = data.user + " " + data.result;
  diceCounts.appendChild(diceroll);

  // Uppdatera totalen för den specifika spelaren
  if (totals[data.user]) {
    totals[data.user] += data.result;
  } else {
    totals[data.user] = data.result;
  }

  // Uppdatera gränssnittet med den nya totalen
  updateTotalDisplay(data.user);
});

formUser.addEventListener("submit", function (e) {
  e.preventDefault();
  myUser = inputUser.value;
  myInputColor = inputColor.value;
  userContainer.innerHTML = `<h2>Välkommen ${myUser} med favoritfärgen ${myInputColor}</h2>`;
  document.querySelector("#user").style.display = "none";
  document.querySelector("#message").style.display = "block";
});

formMessage.addEventListener("submit", function (e) {
  e.preventDefault();
  if (inputMessage.value) {
    const now = new Date(); // Skapa ett datumobjekt för det aktuella datumet och tiden
    socket.emit("chatMessage", {
      user: myUser,
      inputColor: myInputColor,
      message: inputMessage.value,
      date: now, // Lägg till datumet i det skickade objektet
    });
    inputMessage.value = "";
  }
});

socket.on("newChatMessage", function (msg) {
  let item = document.createElement("li");
  item.textContent =
    msg.user +
    " som har favoritfärgen " +
    msg.inputColor +
    ", skriver nu: " +
    msg.message;
  messages.appendChild(item);
  //spara till mongoDB
  //   const newMessage = newMessageModel({
  //     message: message,
  //     user: user,
  //     date: dateTime,
  //   });
  //   newMessage.save();
});

// let today = new Date();
// let date =
//   today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
// let time =
//   today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
// let dateTime = date + " " + time;

function updateTotalDisplay(user) {
  let totalDisplay = totalDisplays.querySelector(`#${user}`);
  if (totalDisplay) {
    totalDisplay.textContent = `Total för ${user}: ${totals[user]}`;
  } else {
    totalDisplay = document.createElement("p");
    totalDisplay.id = user;
    totalDisplay.textContent = `Total för ${user}: ${totals[user]}`;
    totalDisplays.appendChild(totalDisplay);
  }
}
