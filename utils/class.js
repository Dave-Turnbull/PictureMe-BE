const { randomIndex } = require("./utils");

class Room {
  constructor(user, roomID) {
    this.roomID = roomID;
    this.host = user;
    this.users = [user];
  }
  addUser(user) {
    this.users.push(user);
  }
  addGame(rule) {
    const players = this.users;
    const game = new Game(players);
    this.game = game;
    game.addRound("1", rule);
  }
}

class Game {
  constructor(players) {
    this.players = players.map((player) => {
      return { userID: player.userID, username: player.username, score: 0 };
    });
    this.rounds = {};
    this.currentRound = 1;
  }
  addRound(roundNumber, rules) {
    this.rounds[roundNumber] = new Round(rules, this.players);
  }
  nextRound() {
    this.currentRound++;
  }
  updateScore({ userID, score }) {
    this.players.forEach((player) => {
      if (player.userID === userID) {
        player.score += score;
      }
    });
  }
}

class Round {
  constructor(roundRules) {
    this.instructions = roundRules;
    this.roundImages = [];
    this.currentImage = null;
    this.votedImages = [];
    this.votesContinue = 0;
    this.votesFinish = 0;
  }
  addImage(imgData) {
    this.roundImages.push({ ...imgData, votes: 0 });
  }
  setCurrentImageToVote() {
    if (this.roundImages.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.roundImages.length);
    this.currentImage = this.roundImages.splice(randomIndex, 1)[0];
    return this.currentImage;
  }

  addVote() {
    this.currentImage.votes++;
  }
  cycleImageToVote() {
    if (this.roundImages.length !== 0) {
      this.votedImages.push(this.currentImage);
      this.setCurrentImageToVote();
    } else {
      this.currentImage = undefined;
    }
  }
  endRound() {
    if (this.currentImage) {
      this.votedImages.push(this.currentImage);
      this.currentImage = null;
    }
  }
  voteFinish() {
    this.votesFinish++;
  }
  voteContinue() {
    this.votesContinue++;
  }
}

module.exports = { Room, Game, Round };
