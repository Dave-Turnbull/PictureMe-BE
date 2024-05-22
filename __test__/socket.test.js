const ioc = require("socket.io-client");
const { httpServer, io } = require("../app.js");

const idRegex =
  /^[0-9a-zA-Z-_]{10}$/i;

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

//start the server
beforeAll((done) => {
  httpServer.listen(() => {});
  done();
});

//close the server
afterAll((done) => {
  io.close();
  done();
});

//store the connected client sockets to be accessed with clientSockets[n]
let clientSockets = [];

//create a client socket, push it to the client sockets array, then listen for the connection event and resolve when the connection happens
//returns a promise so can be used with async await or .then()
function createClientSocket(userID) {
  const clientSocket = ioc(`http://localhost:${httpServer.address().port}`, {
    auth: {
      userID,
    },
  });
  clientSockets.push(clientSocket);
  return new Promise((resolve, reject) => {
    clientSocket.on("connect", () => {
      resolve();
    });
  });
}

//create 2 client sockets for every test in the clientSockets array
beforeEach(async () => {
  await createClientSocket(1);
  await createClientSocket();
  return;
});

//disconenct all client sockets in the clientSocket array after every test
afterEach((done) => {
  clientSockets.forEach((clientSocket) => {
    if (clientSocket.connected) {
      //disconnect the client
      clientSocket.disconnect();
      //remove the client
      clientSocket.off();
    }
  });
  //reset the clientSockets array so it isnt full of disconnected clients
  clientSockets = [];
  done();
});

describe("a headache", () => {
  it("Clients should connect", () => {
    clientSockets.forEach((clientSocket) => {
      expect(clientSocket.connected).toBeTruthy();
    });
    expect(clientSockets.length > 0).toBeTruthy();
  });
  it("should work with an acknowledgement", (done) => {
    clientSockets[0].emit("hi", (arg) => {
      expect(arg).toBe("hola");
      done();
    });
  });
  it("should be able to create a user and receive confirmation", async () => {
    const username = "user1";
    const result = await clientSockets[0].emitWithAck("userCreation", username);
    expect(result).toBe(`${username} created`, [username]);
  });
  it("should get an array of connected users when joining", async () => {
    const username = "user2";
    await clientSockets[1].emitWithAck("userCreation", username);
    const result = await clientSockets[0].emitWithAck("joinRoom");
    expect(result).toEqual(["user1", "user2"]);
  });
  it("should remove the user from userlist if they leave the game and emit to other users", (done) => {
    const username = "user2";
    clientSockets[1].emit("leaveRoom", username);
    clientSockets[0].once("userLeft", (message) => {
      expect(message).toBe(`${username} has left the game`);
      done();
    });
  });
  it("if user has existing user ID, recieve it from the server", (done) => {
    clientSockets[0].emit("getUserID", (userID) => {
      expect(userID).toBe(1);
      done();
    });
  });
  it("if user has no existing user ID, recieve one from the server", async () => {
    let receivedUserID = await new Promise((resolve) => {
      clientSockets[1].emit("getUserID", (userID) => {
        resolve(userID);
      });
    });
    clientSockets[1].auth.userID = receivedUserID;
    console.log(receivedUserID);
    expect(typeof receivedUserID).toBe("string");
    expect(idRegex.test(receivedUserID)).toBeTruthy();
  });
  it.skip("a room can be created, client recieves ID of room", async () => {
    let receivedRoomID = await new Promise((resolve) => {
      clientSockets[1].emit("createRoom", (roomID) => {
        resolve(roomID);
      });
    });
    expect(idRegex.test(receivedRoomID)).toBeTruthy();
  });
});
