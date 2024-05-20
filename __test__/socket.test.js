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
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", (done) => {
    //Set up the event listener on the client
    clientSocket.on("hello", (arg) => {
      //assert.equal(arg, "world");
      expect(arg).toBe("world")
      done();
    });
    //Start the event from the server
    serverSocket.emit("hello", "world");
  });

  it("should work with an acknowledgement", (done) => {
    //set up the event listener on the server
    serverSocket.on("hi", (callbackfunc) => {
      callbackfunc("hola");
    });
    //start the event on the client
    clientSocket.emit("hi", (arg) => {
      //assert.equal(arg, "hola");
      expect(arg).toBe("hola")
      done();
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.equal(result, "bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});