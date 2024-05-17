const socket = io();

const formUser = document.querySelector("#formUser");
const inputUser = document.querySelector("#inputUser");
const inputColor = document.querySelector("#inputColor");
const messages = document.querySelector("#messages");
const formMessage = document.querySelector("#formMessage");
const inputMessage = document.querySelector("#inputMessage");
const userContainer = document.querySelector("#userContainer");
const throwDiceButton = document.querySelector("#throwDice");
const diceCounts = document.querySelector("#diceCounts");

let myUser;
let myInputColor;


throwDiceButton.addEventListener("click", () => {
  socket.emit("rollDice", { user: myUser });
});
// kopplar submit
formUser.addEventListener("submit", function (e) {
  e.preventDefault();
  myUser = inputUser.value;
  myInputColor = inputColor.value;
  userContainer.innerHTML = `<h2>Välkommen ${myUser} din favoritfärg är ${myInputColor}</h2>`;
  document.querySelector("#user").style.display = "none";
  document.querySelector("#message").style.display = "block";
});

formMessage.addEventListener("submit", function (e) {
  e.preventDefault();
  if (inputMessage.value) {
    console.log(myInputColor);
    socket.emit("chatMessage", {
      user: myUser,
      inputColor: myInputColor,
      message: inputMessage.value,
    });
    inputMessage.value = "";
  }
});

socket.on("diceRolled", (data) => {
  alert(`Du kastade: ${data.result}`);
  // Update UI to display the result as needed
});

// visar chathistorik (allt som alla skickat)
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
