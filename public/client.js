const socket = io();

const formUser = document.querySelector("#formUser");
const inputUser = document.querySelector("#inputUser");
const inputColor = document.querySelector("#inputColor");
const messages = document.querySelector("#messages");
const formMessage = document.querySelector("#formMessage");
const inputMessage = document.querySelector("#inputMessage");
const userContainer = document.querySelector("#userContainer");

let myUser;
let myInputColor;

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
