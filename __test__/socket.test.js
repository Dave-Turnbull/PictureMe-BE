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
  let clientSocket, clientSocket2;

  beforeAll((done) => {
    
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket2 = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
      clientSocket2.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
    clientSocket2.disconnect();
  });

  it("should work with an acknowledgement", (done) => {
    //set up the event listener on the server

    //start the event on the client
    clientSocket.emit("hi", (arg) => {
      //assert.equal(arg, "hola");
      expect(arg).toBe("hola")
      done();
    });
  });

  it("should be able to create a user and receive confirmation", async ()=>{
    const username = 'user1'
    const result = await clientSocket.emitWithAck('userCreation', username)
    expect(result).toBe(`${username} created`)
  })
  
  it("should get an array of connected users when joining", async ()=>{
    const username = 'user2'
    await clientSocket2.emitWithAck('userCreation', username)
    const result = await clientSocket.emitWithAck('joinRoom')
    expect(result).toEqual(['user1', 'user2'])
  })

  it("should remove the user from userlist if they leave the game", async ()=>{
    const username = 'user2'
    await clientSocket2.emit('leaveRoom', username)
    clientSocket.on('userLeft', (message) => {
      console.log('recieved message')
      expect(message).toBe(`${username} has left the game`)
    })
  })
});