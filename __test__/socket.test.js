const ioc = require("socket.io-client");
const { httpServer, io } = require("../app.js");

const idRegex = /^[\w_\-]{9,10}$/i;

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

//start the server
beforeAll(async () => {
  httpServer.listen(() => {});
  await createClientSocket();
  await createClientSocket();
});

//close the server
afterAll((done) => {
  clientSockets.forEach((clientSocket) => {
    if (clientSocket.connected) {
      //disconnect the client
      clientSocket.disconnect();
      //remove the client
      clientSocket.off();
    }
  });
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
  return new Promise((resolve) => {
    clientSocket.on("connect", () => {
      resolve();
    });
  });
}

let createdRoomID;

describe("PictureMe", () => {
  it("Clients should connect", () => {
    clientSockets.forEach((clientSocket) => {
      expect(clientSocket.connected).toBeTruthy();
    });
  });

  it.skip("should remove the user from userlist if they leave the game and emit to other users", (done) => {
    const username = "user2";
    clientSockets[1].emit("leaveRoom", username);
    clientSockets[0].on("userLeft", (message) => {
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
        { roomID: createdRoomID },
        (res, roundData) => {
          resolve({ res, roundData });
        }
      );
    });
    expect(response.res).toBe("game started");
    expect(response.roundData).toEqual(expect.any(String));
  });
  it("when imageUpload is triggered, the file received is attached to the player object inside the rounds array to be the value of img, and all other players are notified of the submission", async () => {
    const response = new Promise((resolve) => {
      clientSockets[0].emit(
        "imageUpload",
        {
          roomID: createdRoomID,
          imageData: {
            userID: "userID",
            img: "buffer",
          },
        },
        (res) => {
          resolve(res);
        }
      );
    });
    const otherUserSubmissionListener = new Promise((resolve) => {
      clientSockets[1].on("userPictureSubmitted", (message) => {
        resolve(message);
      });
    });

    const resolved = await Promise.all([response, otherUserSubmissionListener]);

    expect(resolved).toEqual(["image uploaded", "user submitted"]);
  });
  it("when all users have submitted an image, sender recieves confirmation, and all other users are notified, then submissions end and start votes events is emitted to all users", async () => {
    const response = new Promise((resolve) => {
      clientSockets[1].emit(
        "imageUpload",
        {
          roomID: createdRoomID,
          imageData: {
            userID: "userID",
            img: "buffer",
          },
        },
        (res) => {
          resolve(res);
        }
      );
    });

    const otherUserSubmittedPictureListener = new Promise((resolve) => {
      clientSockets[0].on("userPictureSubmitted", (message) => {
        resolve(message);
      });
    });

    const allUsersSubmitted = new Promise((resolve) => {
      clientSockets[0].on("submissionsEnd", (message) => {
        resolve(message);
      });
    });

    const startVotes = new Promise((resolve) => {
      clientSockets[0].on("startVotes", (message) => {
        console.log(message);
        resolve(message);
      });
    });

    const resolved = await Promise.all([
      response,
      otherUserSubmittedPictureListener,
      allUsersSubmitted,
      startVotes,
    ]);

    expect(resolved).toEqual([
      "image uploaded",
      "user submitted",
      "all submitted",
      {
        img: "buffer",
        userID: "userID",
      },
    ]);
  });
});
