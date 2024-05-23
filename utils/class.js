class Room {
  constructor(roomID, user) {
    this.host = user;
    this.users = [user];
  }
  addUser(user) {
    this.users.push(user);
  }
}

module.exports = { Room };
