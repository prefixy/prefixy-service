require('dotenv').config();
const fs = require('fs');
const path = require('path');
const randomstring = require("randomstring");
const jwt = require("jsonwebtoken");

const CONFIG_FILE = path.resolve(path.dirname(__dirname), "prefixy-service-config.json");
const { demoTenant } = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
const demoToken = jwt.sign({ tenant: demoTenant }, process.env.SECRET);

module.exports = {
  demoToken,

  generate: function() {
    const tenant = randomstring.generate(6);
    return jwt.sign({ tenant }, process.env.SECRET);
  },

  validate: function(token) {
    jwt.verify(token, process.env.SECRET);
  }
};
