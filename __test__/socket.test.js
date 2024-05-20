const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");
const assert = require("assert");
const {httpServer, io} = require("../app.js")
function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let serverSocket, clientSocket;

  beforeAll((done) => {
    
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it.only("should work with an acknowledgement", (done) => {
    //set up the event listener on the server

    //start the event on the client
    clientSocket.emit("hi", (arg) => {
      //assert.equal(arg, "hola");
      expect(arg).toBe("hola")
      done();
    });
  });
});