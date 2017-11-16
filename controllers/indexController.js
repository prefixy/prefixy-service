const path = require('path');
const Tokens = require(path.resolve(path.dirname(__dirname), 'modules/tokens'));

module.exports = {
  index: function(req, res) {
    res.render('index', { demoToken: Tokens.demoToken });
  },

  story: function(req, res) {
    res.render('story');
  },

  about: function(req, res) {
    res.render('about');
  }
};
