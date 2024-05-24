class Room {
  constructor(user, roomID) {
    this.roomID = roomID;
    this.host = user;
    this.users = [user];
  }
  addUser(user) {
    this.users.push(user);
  }
  addGame(rules) {
    const players = this.users;
    const game = new Game(players);
    this.game = game;
    game.addRound('1', rules);
  }
}

class Game {
  constructor(players) {
    this.players = players.map((player) => { return { username: player.username, score: 0 } });
    this.rounds = {};
  }
  addRound(roundNumber, rules) {
    this.rounds[roundNumber] = new Round(rules);
  }
}

class Round {
  constructor(roundRules) {
    this.round = roundRules;
    this.roundImages = []
  }
  addImage(imgData) {
    this.roundImages.push(imgData)
  }
}
module.exports = { Room, Game, Round };

//Testing a full game sequence
// const roomExample = new Room({ username: "user1" }, 'mockRoomID');
// roomExample.addUser({ username: "user2" });
// roomExample.addGame('round1 string');

// console.log(roomExample.game.rounds);

// roomExample.game.rounds['1'].addImg({ jake: { img: "imagedata", votes: 0 } });
// roomExample.game.rounds['1'].addImg({ david: { img: "imagedata", votes: 0 } });

// console.log('Whole room obj', roomExample);
// console.log(roomExample.game.rounds)
// console.log(roomExample.game.rounds['1'].roundImages)