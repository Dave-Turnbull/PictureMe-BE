const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { sendLandingPage } = require("./controllers/http-controllers");
const { createUser, generateID } = require("./utils/utils");
const { Room } = require("./utils/class.js");

app.use(cors());
const httpServer = http.createServer(app);

const io = new Server(httpServer);
app.get("/", sendLandingPage);

let users = [];
const rooms = {};

//Create sessions so users can reconnect
io.use(async (socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (userID) {
    const session = false; //change false to room finder function
    if (session) {
      //send/trigger room
      return next();
    }
    socket.userID = userID;
    return next();
  }
  //Will need to change to longer hash for user auth.
  socket.userID = generateID();
  next();
});

io.on("connection", (socket) => {
  socket.on("getUserID", (callbackfunc) => {
    callbackfunc(socket.userID);
  });

  socket.on("createRoom", (respond) => {
    const generatedRoomID = generateID();
    socket.join( generatedRoomID );
    rooms[generatedRoomID] = new Room(generatedRoomID)
    respond("room created", rooms);
  });

  socket.on("hi", (callbackfunc) => {
    callbackfunc("hola");
  });
  socket.on("userCreation", (username, response) => {
    users = [...users, username];
    response(`${username} created`, users);
  });
  socket.on("joinRoom", (response) => {
    response(users);
  });
  socket.on("leaveRoom", (username) => {
    socket.broadcast.emit("userLeft", `${username} has left the game`);
  });

  socket.onAny((event, ...args) => {
    console.log("Server triggered event:\n", event, args);
  });
  socket.onAnyOutgoing((event, ...args) => {
    console.log("Server sent an event to client:\n", event, args);
  });
});

module.exports = { app, httpServer, io };
