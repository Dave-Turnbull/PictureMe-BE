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
    game.addRound("1", rules);
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
  updateScore({ userID, score }) {
    this.players.forEach((player) => {
      if (player.userID === userID) {
        player.score += score;
      }
    });
  }
}

class Round {
  constructor(roundRules, players) {
    this.instructions = roundRules;
    this.players = players
    this.roundImages = [];
    this.currentImage = null;
    this.votedImages = [];
  }
  addImage(imgData) {
    this.roundImages.push({ ...imgData, votes: 0, score: 0 });
  }
  setCurrentImageToVote() {
    if (this.roundImages.length === 0) {
      this.votedImages.push(this.currentImage);
      this.endRound()
    } else {
      const randomIndex = Math.floor(Math.random() * this.roundImages.length);
      this.currentImage = this.roundImages.splice(randomIndex, 1)[0];
      return this.currentImage;
    }
  }
  addVote(userID) {
    if(this.currentImage.votes === this.players.length){
      this.cycleImageToVote()
    }
    if (this.currentImage.userID === userID) {
      this.currentImage.votes++;
      this.currentImage.score += 500;
    }else{
      this.currentImage.votes++
    }
  }
  cycleImageToVote(){
    if (this.currentImage){
      this.votedImages.push(this.currentImage);
      this.setCurrentImageToVote()
    }
  }
  endRound(){
    console.log("end of round, no more pics")

  }
}

module.exports = { Room, Game, Round };

// Testing a full game sequence
const roomExample = new Room(
  { username: "user1", userID: "userID1" },
  "mockRoomID"
);
roomExample.addUser({ username: "user2", userID: "userID2" });
roomExample.addUser({ username: "user3", userID: "userID3" });
roomExample.addUser({ username: "user4", userID: "userID4" });
roomExample.addGame("round1 string");
roomExample.game.rounds["1"].addImage({ userID: "userID1", img: "imagedata" });
roomExample.game.rounds["1"].addImage({ userID: "userID2", img: "imagedata" });
roomExample.game.rounds["1"].addImage({ userID: "userID3", img: "imagedata" });
roomExample.game.rounds["1"].addImage({ userID: "userID4", img: "imagedata" });
console.log(roomExample.game.rounds["1"]);
roomExample.game.rounds["1"].setCurrentImageToVote();
console.log(roomExample.game.rounds["1"]);
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1")
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1")
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1")
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1")
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1")
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1");
roomExample.game.rounds["1"].addVote("userID1")
roomExample.game.rounds["1"].addVote("userID1")
console.log(roomExample.game.rounds["1"]);
// roomExample.game.updateScore({ userID: "userID2", score: 200 });
// console.log("roomID", roomExample.roomID);
// console.log("host", roomExample.host);
// console.log("users", roomExample.users);
// console.log("current round", roomExample.game.currentRound);
// console.log("players", roomExample.game.players);
// console.log("rounds", roomExample.game.rounds);
// console.log("round1 images", roomExample.game.rounds["1"].roundImages);
// console.log(roomExample.game);
// console.log(roomExample.game.rounds["1"].roundImages);
