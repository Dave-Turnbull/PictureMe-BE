class Room {
  constructor(roomID, user) {
    this.roomID = roomID;
    this.users = [user];
  }
  addUser(userObject) {
    this.users.push(userObject);
  }
  joinRoom(userObject) {
    
  }
}

module.exports = {Room}

