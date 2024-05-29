const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { generateID, randomRule } = require("./utils/utils");
const { Room } = require("./utils/class.js");

app.use(cors());


app.get( '/', ( req, res ) =>
{
  res.status(200).send()
})

const httpServer = http.createServer(app);
const io = new Server( httpServer );

const rooms = {};
const userSessions = {};

io.on( "connection", ( socket, res ) =>
{
  res('connected')
  let userID = socket.handshake.auth.userID;

  if (userID && userSessions[userID]) {
    socket.userID = userID;
    return next();
  } else {
    userID = generateID();
    userSessions[userID] = { userID };
    socket.userID = userID;
  }

  let roomID;
  let room;
  let game;
  let players;
  let currentRound;
  let totalImgVotes;

  socket.on("getUserID", (res) => {
    res(socket.userID);
  });

  socket.on("createRoom", (user, res) => {
    
    const userObj = { userID: socket.userID, username: user.username };
    roomID = generateID();
    socket.join(roomID);
    rooms[roomID] = new Room(userObj, roomID);
    room = rooms[roomID];
    res("room created", rooms[roomID]);
  });

  socket.on("joinRoom", (data, res) => {
    let user = data.user;
    roomID = data.roomID;
    room = rooms[roomID];
    const userObj = { userID: socket.userID, username: user.username };
    room.addUser(userObj);
    io.in(roomID).emit("updateUsersArray", room.users);
    res("joined", room.users);
  });

  socket.on("startGame", (res) => {
    room.addGame(randomRule());
    currentRound = String(room.game.currentRound);
    res("game started");
    io.emit("startRound", room.game.rounds[currentRound].instructions);
  });

  socket.on("imageUpload", ({ imageData }, res) => {
    room = rooms[roomID];
    game = room.game;
    players = game.players;
    currentRound = game.currentRound;
    game.rounds[currentRound].addImage(imageData);
    res("image uploaded");

    io.emit("userPictureSubmitted", "user submitted");

    if (game.rounds[currentRound].roundImages.length === players.length) {
      game.rounds[currentRound].setCurrentImageToVote();
      io.emit("startVotes", {
        img: game.rounds[currentRound].currentImage.img,
        userID: game.rounds[currentRound].currentImage.userID,
      });
    }
  });

  socket.on("userVote", ({ voteData, imgUserID }, res) => {
    currentRound = game.currentRound;
    game.rounds[currentRound].addVote(imgUserID);
    game.updateScore(voteData);
    io.emit("userVoted", "user voted");
    res("vote counted");

    players = game.players;
    totalImgVotes = game.rounds[currentRound].currentImage.votes;

    if (players.length - 1 === totalImgVotes) {
      game.rounds[currentRound].cycleImageToVote();
      if (game.rounds[currentRound].currentImage) {
        io.emit("nextImage", game.rounds[currentRound].currentImage);
      } else {
        io.emit("endRound", game.players);
        game.rounds[currentRound].endRound();
      }
    }
  });

  socket.on("continueGame", (res) => {
    res("game continuing");
    game.nextRound();
    currentRound = game.currentRound;
    game.addRound(currentRound, randomRule());
    io.emit("startRound", game.rounds[currentRound].instructions);
  });

  socket.on("endGame", (res) => {
    res("thanks for playing!");
    io.emit("finished", game);
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
