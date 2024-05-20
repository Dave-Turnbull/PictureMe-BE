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

io.on("connection", (socket) => {
  socket.on("hi", (callbackfunc) => {
    callbackfunc("hola");
  });
  socket.on('userCreation', (object) => {
    object.callBack(`${object.user} created`);
  });
});

module.exports = {app, httpServer, io};