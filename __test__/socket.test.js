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
let userID1;
let userID2;

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
    await new Promise((resolve) => {
      clientSockets[0].emit("getUserID", (userID) => {
        userID1 = userID;
        resolve(userID);
      });
    });
    let receivedUserID = await new Promise((resolve) => {
      clientSockets[1].emit("getUserID", (userID) => {
        userID2 = userID;
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
        { userID: userID2, username: "user1" },
        (message, room) => {
          resolve({ message, room });
        }
      );
    });
    createdRoomID = response.room.roomID;
    expect(response.message).toBe("room created");
  });
  it("upon joining room, adds user to user array on room object and recieves confirmation string", async () => {
    let response = await new Promise((resolve) => {
      clientSockets[0].emit(
        "joinRoom",
        { user: { userID: userID1, username: "user2" }, roomID: createdRoomID },
        (res, users) => {
          resolve({ res, users });
        }
      );
    });
    expect(response.res).toBe("joined");
    expect(response.users).toEqual({
      host: { userID: expect.any(String), username: "user1" },
      roomID: expect.any(String),
      users: expect.any(Object),
    });
  });
  it("upon game start the users in the room should be put into the players array, sent round 1 data", async () => {
    const response = new Promise((resolve) => {
      clientSockets[0].emit("startGame", (res) => {
        resolve(res);
      });
    });

    const gameStartedPromise1 = new Promise((resolve) => {
      clientSockets[0].on("startRound", (message) => {
        resolve(message);
      });
    });

    const gameStartedPromise2 = new Promise((resolve) => {
      clientSockets[1].on("startRound", (message) => {
        resolve(message);
      });
    });

    const resolved = await Promise.all([
      response,
      gameStartedPromise1,
      gameStartedPromise2,
    ]);

    expect(resolved).toEqual([
      "game started",
      expect.any(String),
      expect.any(String),
    ]);
  });
  it("when imageUpload is triggered, the file received is attached to the player object inside the rounds array to be the value of img, and all other players are notified of the submission", async () => {
    const response = new Promise((resolve) => {
      clientSockets[0].emit(
        "imageUpload",
        {
          userID: userID1,
          img: "buffer1",
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
          userID: userID2,
          img: "buffer2",
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

    const startVotes = new Promise((resolve) => {
      clientSockets[0].on("startVotes", (message) => {
        resolve(message);
      });
    });

    const resolved = await Promise.all([
      response,
      otherUserSubmittedPictureListener,
      startVotes,
    ]);

    expect(resolved).toEqual([
      "image uploaded",
      "user submitted",
      {
        img: expect.any(String),
        userID: expect.any(String),
      },
    ]);
  });
  it("on userVote event, client gets a message and all users in game are notified", async () => {
    const user1Voted = new Promise((resolve) => {
      clientSockets[0].emit(
        "userVote",
        {
          voteData: {
            userID: userID1,
            score: 200,
          },
          imgUserID: userID2,
        },
        (res) => {
          resolve(res);
        }
      );
    });
    const user2Voted = new Promise((resolve) => {
      clientSockets[1].emit(
        "userVote",
        {
          voteData: {
            userID: userID2,
            score: 200,
          },
          imgUserID: userID2,
        },
        (res) => {
          resolve(res);
        }
      );
    });

    const userVotedEvent = new Promise((resolve) => {
      clientSockets[1].on("userVoted", (message) => {
        resolve(message);
      });
    });

    const newImageEvent = new Promise((resolve) => {
      clientSockets[1].on("nextImage", (message) => {
        resolve(message);
      });
    });

    const [voted, userVoted, votedEvent, imageEvent] = await Promise.all([
      user1Voted,
      user2Voted,
      userVotedEvent,
      newImageEvent,
    ]);
    expect(voted).toBe("vote counted");
    expect(userVoted).toBe("vote counted");
    expect(votedEvent).toBe("user voted");
    expect(imageEvent).toMatchObject({
      userID: expect.any(String),
      img: expect.any(String),
    });
  });
  it("second image is sent to client after image 1 voting ends", async () => {
    const user2Voted = new Promise((resolve) => {
      clientSockets[1].emit(
        "userVote",
        {
          roomID: createdRoomID,
          voteData: {
            userID: userID2,
            score: 200,
          },
          imgUserID: userID1,
        },
        (res) => {
          resolve(res);
        }
      );
    });
    const user1Voted = new Promise((resolve) => {
      clientSockets[0].emit(
        "userVote",
        {
          roomID: createdRoomID,
          voteData: {
            userID: userID1,
            score: 200,
          },
          imgUserID: userID1,
        },
        (res) => {
          resolve(res);
        }
      );
    });
    const userVotedEvent = new Promise((resolve) => {
      clientSockets[0].on("userVoted", (message) => {
        resolve(message);
      });
    });

    const endRoundEvent = new Promise((resolve) => {
      clientSockets[1].on("endRound", (message) => {
        resolve(message);
      });
    });

    const resolved = await Promise.all([
      user2Voted,
      user1Voted,
      userVotedEvent,
      endRoundEvent,
    ]);

    expect(resolved).toEqual([
      "vote counted",
      "vote counted",
      "user voted",
      [
        {
          score: expect.any(Number),
          userID: expect.any(String),
          username: expect.any(String),
        },
        {
          score: expect.any(Number),
          userID: expect.any(String),
          username: expect.any(String),
        },
      ],
    ]);
  });
  it("at the end of a round users can vote to continue game", async () => {
    const user1Continue = new Promise((resolve) => {
      clientSockets[0].emit("voteContinue", (res) => {
        resolve(res);
      });
    });
    const user1VotedEvent = new Promise((resolve) => {
      clientSockets[1].on("userVotedContinue", (message) => {
        console.log(message);
        resolve(message);
      });
    });
    const resolved = await Promise.all([user1Continue, user1VotedEvent]);
    expect(resolved).toEqual([
      "vote counted",
      {
        continue: 1,
        finish: 0,
      },
    ]);
  });
  it("at the end of a round users can vote to finish game", async () => {
    const user2Finish = new Promise((resolve) => {
      clientSockets[1].emit("voteFinish", (res) => {
        resolve(res);
      });
    });
    const user2VotedEvent = new Promise((resolve) => {
      clientSockets[0].on("userVotedFinish", (message) => {
        console.log(message);
        resolve(message);
      });
    });
    const gameFinish = await new Promise((resolve) => {
      clientSockets[0].on("gameEnd", (message) => {
        resolve(message);
      });
    });
    const resolved = await Promise.all([
      user2Finish,
      user2VotedEvent,
      gameFinish,
    ]);
    expect(resolved).toEqual([
      "vote counted",
      {
        continue: 1,
        finish: 1,
      },
      "game ended",
    ]);
  });
});
