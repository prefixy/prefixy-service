const randomstring = require("randomstring");
const jwt = require("jsonwebtoken");
const secret = "so-many-pizzerias"

module.exports = {
  generate: function() {
    const tenant = randomstring.generate(6);
    return jwt.sign({tenant}, secret);
  },

  validate: function(token) {
    jwt.verify(token, secret);
  }
};
