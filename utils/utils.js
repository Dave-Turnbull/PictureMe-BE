const shortid = require("shortid");

exports.generateID = () => {
  return shortid.generate();
};

