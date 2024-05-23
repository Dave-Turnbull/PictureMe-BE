class Room {
  constructor(user) {
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
    this.players = [...players];
    this.rounds = {};
  }
  addRound(roundNumber) {
    this.rounds[roundNumber] = new Round(roundNumber, "cuddly toy");
  }
}

class Round {
  constructor(roundRules) {
    this.roundData = { text: roundRules, images: [] };
  }
  addImg(imgData) {
    this.roundData.images.push(imgData);
  }
}
module.exports = { Room, Game, Round };

//Testing a full game sequence
const roomExample = new Room({ username: "user1" });
roomExample.addUser({ username: "user2" });
roomExample.addGame();
roomExample.game.addRound("2");
console.log('Whole room obj', roomExample);

const round = new Round(1, "roundrules");
round.addImg("1", { jake: { img: "imagedata", votes: 0 } });
round.addImg("1", { david: { img: "imagedata", votes: 0 } });
// round['1'].images.forEach((submission) => {
//   console.log(submission);
// });
