const ioc = require("socket.io-client");
const {httpServer, io} = require("../app.js");

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}


let port;

beforeAll((done) => {
  httpServer.listen(() => {
    port = httpServer.address().port;
  });
  done()
});


afterAll((done) => {
  io.close();
  done()
});


const clientSockets = []

function createClientSocket(done) {
  const clientSocket = ioc(`http://localhost:${port}`);
  clientSockets.push(clientSocket)
  clientSocket.on("connect", done);
}

beforeEach((done) => {
  createClientSocket(done)
  createClientSocket(done)
})
afterEach((done) => {
  clientSockets.forEach((clientSocket) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  })
})

describe("a headache", () => {
  it("should work with an acknowledgement", (done) => {
    clientSockets[0].emit("hi", (arg) => {
      expect(arg).toBe("hola")
      done();
    });
  });

  it("should be able to create a user and receive confirmation", async ()=>{
    const username = 'user1'
    const result = await clientSockets[0].emitWithAck('userCreation', username)
    expect(result).toBe(`${username} created`, [username])
  })
  
  it("should get an array of connected users when joining", async ()=>{
    const username = 'user2'
    await clientSockets[1].emitWithAck('userCreation', username)
    const result = await clientSockets[0].emitWithAck('joinRoom')
    expect(result).toEqual(['user1', 'user2'])
  })

  //userLeft event isn't triggering in the below test, cant work out why
  it("should remove the user from userlist if they leave the game and emit to other users", (done)=>{
    const username = 'user2'
    clientSockets[1].emit('leaveRoom', username)
    clientSockets[0].once('userLeft', (message) => {
        expect(message).toBe(`${username} has left the game`)
        done()
    });
  })
});