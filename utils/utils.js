const shortid = require('shortid');

exports.generateID = () => {
    return shortid.generate();
  };

exports.createUser = (sessionID, username, isHost = false) => {
    users.push({ sessionID, username, isHost });
  };