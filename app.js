const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { sendLandingPage } = require("./controllers/http-controllers");
const {generateID } = require("./utils/utils");
const { Room } = require("./utils/class.js");

app.use(cors());
const httpServer = http.createServer(app);

const io = new Server(httpServer);
app.get("/", sendLandingPage);

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
  socket.on("createRoom", (user, response) => {
    const userObj = {userID:socket.userID, username: user.username}
    const generatedRoomID = generateID();
    socket.join(generatedRoomID);
    rooms[generatedRoomID] = new Room(userObj, generatedRoomID);
    response("room created", rooms[generatedRoomID]);
  });
  socket.on("joinRoom", ({ user, roomID }, response) => {
    const userObj = {userID:socket.userID, username: user.username}
    rooms[roomID].addUser(userObj);
    io.in(roomID).emit('updateUsersArray', rooms[roomID].users)
    response("joined", rooms[roomID]);
  });
  socket.on("startGame", ({roomID}, response) => {
    rooms[roomID].addGame()
    response("game started", rooms[roomID].game.rounds[0]);
  })

  socket.on("leaveRoom", (username) => {
    socket.broadcast.emit("userLeft", `${username} has left the game`);
  });

  socket.on("imageUpload", ({ roomID, imageData }, response) => {
    const currentRound = '1'
     console.log(rooms[roomID].game.rounds[currentRound]);
    rooms[roomID].game.rounds[currentRound].addImage(imageData)
    response("file uploaded")
  })
  socket.onAny((event, ...args) => {
    console.log("Server triggered event:\n", event, args);
  });
  socket.onAnyOutgoing((event, ...args) => {
    // console.log("Server sent an event to client:\n", event, args);
  });
});

module.exports = { app, httpServer, io };
