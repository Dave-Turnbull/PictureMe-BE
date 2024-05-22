const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { sendLandingPage } = require("./controllers/http-controllers");

app.use(cors());
const httpServer = http.createServer(app);

const io = new Server(httpServer);

app.get("/", sendLandingPage);

let users = [];

const createUser = (sessionID, username, isHost = false) => {
  users.push({sessionID, username, isHost})
}

//Create sessions so users can reconnect
io.use(async (socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (userID) {
    const session = false //change false to room finder function
    if (session) {
      //send/trigger room
      return next()
    }
    socket.userID = userID
    return next()
  }
  socket.userID = 'a random id'
  next()
})

io.on("connection", (socket) => {
  socket.on("getUserID", (callbackfunc) => {
    callbackfunc(socket.userID)
  })

  socket.on("hi", (callbackfunc) => {
    callbackfunc("hola");
  });

  socket.on('userCreation', (username, response) => {

    users = [...users, username]
    response(`${username} created`, users)
  });
  socket.on('joinRoom', (response) => {
    response(users)
  })
  socket.on('leaveRoom', (username) => {
    socket.broadcast.emit('userLeft', `${username} has left the game`)
  })


  socket.onAny((event, ...args) => {
    console.log('Server triggered event:\n', event, args);
  });
  socket.onAnyOutgoing((event, ...args) => {
    console.log('Server sent an event to client:\n', event, args);
  });
});

module.exports = {app, httpServer, io};