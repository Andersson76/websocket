const socket = io();

const formUser = document.querySelector("#formUser");
const inputUser = document.querySelector("#inputUser");
const inputColor = document.querySelector("#inputColor");
const messages = document.querySelector("#messages");
const formMessage = document.querySelector("#formMessage");
const inputMessage = document.querySelector("#inputMessage");
const userContainer = document.querySelector("#userContainer");
const throwDice = document.querySelector("#throwDice");
const resetGame = document.querySelector("#resetGame"); // Ny reset-knapp
const diceCounts = document.querySelector("#diceCounts");
const totalDisplays = document.querySelector("#totalDisplays");

let myUser;
let myInputColor;
//let totals = {}; // Objekt för att lagra totalen för varje spelare

throwDice.addEventListener("click", () => {
  socket.emit("rollDice", { user: myUser });
});

resetGame.addEventListener("click", () => {
  socket.emit("resetGame", { user: myUser });
});

socket.on("diceRolled", (data) => {
  const { user, result, total } = data;

  // Uppdatera tärningskast
  let diceroll = document.createElement("li");
  diceroll.textContent = `${user} kastade: ${result}`;
  diceCounts.appendChild(diceroll);

  // Uppdatera total summa
  let userTotal = document.querySelector(`#${user}-total`);
  if (!userTotal) {
    userTotal = document.createElement("div");
    userTotal.id = `${user}-total`;
    userTotal.innerHTML = `<strong>${user} total:</strong> <span>${total}</span>`;
    totalDisplays.appendChild(userTotal);
  } else {
    userTotal.querySelector("span").textContent = total;
  }
});

socket.on("gameReset", (user) => {
  const userTotal = document.querySelector(`#${user}-total`);
  if (userTotal) {
    userTotal.querySelector("span").textContent = 0;
  }
  diceCounts.innerHTML = "";
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
});

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
