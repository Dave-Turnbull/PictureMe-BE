const ioc = require("socket.io-client");
const { httpServer, io } = require("../app.js");

const idRegex = /^[\w_\-]{9,10}$/i;

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
  await createClientSocket();
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

let createdRoomID;

describe("PictureMe", () => {
  it("Clients should connect", () => {
    clientSockets.forEach((clientSocket) => {
      expect(clientSocket.connected).toBeTruthy();
    });
    expect(clientSockets.length > 0).toBeTruthy();
  });

  it("should remove the user from userlist if they leave the game and emit to other users", (done) => {
    const username = "user2";
    clientSockets[1].emit("leaveRoom", username);
    clientSockets[0].once("userLeft", (message) => {
      expect(message).toBe(`${username} has left the game`);
      done();
    });
  });
  //Skip if testing users are new and not joining an existing game
  it.skip("if user has existing user ID, recieve it from the server", (done) => {
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
    expect(idRegex.test(receivedUserID)).toBeTruthy();
  });
  it("a room can be created, client recieves ID of room", async () => {
    let response = await new Promise((resolve) => {
      clientSockets[1].emit(
        "createRoom",
        { username: "user1" },
        (message, rooms) => {
          resolve({ message, rooms });
        }
      );
    });
    createdRoomID = response.rooms.roomID;
    expect(response.message).toBe("room created");
  });
  it("upon joining room, adds user to user array on room object and recieves confirmation string", async () => {
    let response = await new Promise((resolve) => {
      clientSockets[1].emit(
        "joinRoom",
        { user: { username: "user2" }, roomID: createdRoomID },
        (res, rooms) => {
          resolve({ res, rooms });
        }
      );
    });
    expect(response.res).toBe("joined");
    expect(response.rooms.users).toEqual([
      { userID: expect.any(String), username: "user1" },
      { userID: expect.any(String), username: "user2" },
    ]);
  });
  it("upon game start the users in the room should be put into the players array, sent round 1 data", async () => {
    let response = await new Promise((resolve) => {
      clientSockets[0].emit(
        "startGame",
        {roomID: createdRoomID},
        (res, rooms) => {
          resolve({ res, rooms });
        }
      );
    });
    expect(response.res).toBe("game started");
  });
  it("when imageUpload is triggered, the file received is attached to the player object inside the rounds array to be the value of img ", async () => {
    let response2 = await new Promise((resolve) => {
      clientSockets[0].emit(
        "imageUpload",
        { roomID: createdRoomID, imageData: { 'user1': { img: "imagedata", votes: 0 } } },
        (res) => {
          resolve({ res });
        }
      );
    });
    let response = await new Promise((resolve) => {
      clientSockets[0].emit(
        "imageUpload",
        { roomID: createdRoomID, imageData: { 'user2': { img: "imagedata", votes: 0 } } },
        (res) => {
          resolve({ res });
        }
      );
    });
    expect(response.res).toBe("image uploaded");
      clientSockets[0].once("submissionsEnd", (message) => {
        expect(message).toEqual([{ 'user1': { img: "imagedata", votes: 0 } }, { 'user2': { img: "imagedata", votes: 0 } }]);
        done();
      });
  });
});
