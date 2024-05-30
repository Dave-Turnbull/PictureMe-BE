const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { generateID, randomRule } = require("./utils/utils");
const { Room } = require("./utils/class.js");

app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};
const userSessions = {};

io.on("connection", (socket) => {
  socket.emit("connected", "You are now connected to the server");

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
    if (res) {
      res(socket.userID);
    } else {
      console.warn("callback not sent");
    }
  });

  socket.on("createRoom", (user, res) => {
    const userObj = { userID: socket.userID, username: user.username };
    roomID = generateID();
    socket.join(roomID);
    rooms[roomID] = new Room(userObj, roomID);
    room = rooms[roomID];
    if (res) {
      res("room created", rooms[roomID]);
    } else {
      console.warn("callback not sent");
    }
  });

  socket.on("getRoom", (roomID, res) => {
    res(rooms[roomID]);
  });

  socket.on("joinRoom", (data, res) => {
    let user = data.user;
    roomID = data.roomID;
    room = rooms[roomID];
    const userObj = { userID: socket.userID, username: user.username };
    room.addUser(userObj);
    io.in(roomID).emit("updateUsersArray", room);
    if (res) {
      res("joined", room);
    } else {
      console.warn("callback not sent");
    }
  });

  socket.on("startGame", (res) => {
    if (res) {
      res("game started");
    } else {
      console.warn("callback not sent");
    }
    room.addGame(randomRule());
    currentRound = String(room.game.currentRound);
    io.emit("startRound", room.game.rounds[currentRound].instructions);
  });

  socket.on("imageUpload", (imageData, res) => {
    room = rooms[roomID];
    game = room.game;
    players = game.players;
    currentRound = game.currentRound;
    game.rounds[currentRound].addImage(imageData);
    if (res) {
      res("image uploaded");
    } else {
      console.warn("callback not sent");
    }

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
    if (res) {
      res("vote counted");
    } else {
      console.warn("callback not sent");
    }

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
    if (res) {
      res("game continuing");
    } else {
      console.warn("callback not sent");
    }
    game.nextRound();
    currentRound = game.currentRound;
    game.addRound(currentRound, randomRule());
    io.emit("startRound", game.rounds[currentRound].instructions);
  });

  socket.on("endGame", (res) => {
    if (res) {
      res("thanks for playing!");
    } else {
      console.warn("callback not sent");
    }
    delete rooms[roomID];
    io.emit("finished", game);
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
