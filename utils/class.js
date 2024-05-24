class Room {
  constructor(user, roomID) {
    this.roomID = roomID;
    this.host = user;
    this.users = [user];
  }
  addUser(user) {
    this.users.push(user);
  }
  addGame() {
    const players = this.users;
    const game = new Game(players);
    this.game = game;
    game.addRound("1");
  }
}

class Game {
  constructor(players) {
    this.players = players.map((player) => { return { username: player.username, score: 0 } });
    this.rounds = {};
  }
  addRound(roundNumber, Rules) {
    this.rounds[roundNumber] = new Round(roundRules);
  }
}

class Round {
  constructor(roundRules) {
    this.roundData = { roundRules, images: [] };
  }
  addImg(imgData) {
    this.roundData.images.push(imgData);
  }
}
module.exports = { Room, Game, Round };

//Testing a full game sequence
const roomExample = new Room({ username: "user1" }, 'mockRoomID');
roomExample.addUser({ username: "user2" });
roomExample.addGame();
roomExample.game.addRound("2");
roomExample.game.rounds['1'].addImg({ jake: { img: "imagedata", votes: 0 } });
roomExample.game.rounds['1'].addImg({ david: { img: "imagedata", votes: 0 } });

// console.log('Whole room obj', roomExample);
// console.log(roomExample.game.rounds['1'].roundData.images)