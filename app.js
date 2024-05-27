const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { sendLandingPage } = require("./controllers/http-controllers");
const { generateID } = require("./utils/utils");
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

const rules = [
  "something red",
  "something from your fridge",
  "something nerdy",
  "something from your childhood",
  "something from your wardrobe",
];

io.on("connection", (socket) => {
  let room;
  let game;
  let players;
  let currentRound;

  socket.on("getUserID", (callbackfunc) => {
    callbackfunc(socket.userID);
  });

  socket.on("createRoom", (user, response) => {
    const userObj = { userID: socket.userID, username: user.username };
    const roomID = generateID();
    socket.join(roomID);
    rooms[roomID] = new Room(userObj, roomID);
    response("room created", rooms[roomID]);
  });

  socket.on("joinRoom", ({ user, roomID }, response) => {
    room = rooms[roomID];
    const userObj = { userID: socket.userID, username: user.username };
    room.addUser(userObj);
    io.in(roomID).emit("updateUsersArray", room.users);
    response("joined", room);
  });

  socket.on("startGame", ({ roomID }, response) => {
    room = rooms[roomID];
    room.addGame(rules[0]);
    response("game started", room.game.rounds["1"].instructions);
  });

  socket.on("imageUpload", async ({ roomID, imageData }, response) => {
    game = rooms[roomID].game;
    players = game.players;
    currentRound = game.rounds["1"];
    currentRound.addImage(imageData);
    response("image uploaded");

    io.emit("userPictureSubmitted", "user submitted");

    if (currentRound.roundImages.length === players.length) {
      io.emit("submissionsEnd", "all submitted");
      io.emit("startVotes", imageData);
    }
  });

  socket.on("userVote", ({ roomID, userScore, imgTakerID }) => {
    currentRound = rooms[roomID].game.rounds["1"];
    currentRound.addVote(userID);

    io.to(roomID).emit("userVoted");
    if (currentRound.roundImages["1"].votes === players.length) {
      io.to(roomID).emit("votingEnd", votes);
    }
  });

  socket.on("leaveRoom", (username) => {
    socket.broadcast.emit("userLeft", `${username} has left the game`);
  });

  socket.onAny((event, ...args) => {
    // console.log("Server triggered event:\n", event, args);
  });

  socket.onAnyOutgoing((event, ...args) => {
    // console.log("Server sent an event to client:\n", event, args);
  });
});

module.exports = { app, httpServer, io };
