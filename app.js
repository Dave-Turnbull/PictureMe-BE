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

// Stored users
let users = [];

io.on("connection", (socket) => {
  socket.on("hi", (callbackfunc) => {
    callbackfunc("hola");
  });

  socket.on('userCreation', (username, response) => { 
    users = [...users, username]
    response(`${username} created`)
  });
  socket.on('joinRoom', (response) => {
    response(users)
  })
  socket.on('leaveRoom', (username) => {
    console.log('in leaveRoom');
    socket.emit('userLeft', `${username} has left the game`)
  })
});

module.exports = {app, httpServer, io};