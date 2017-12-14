const path = require('path');
const Tokens = require(path.resolve(path.dirname(__dirname), 'modules/tokens'));

module.exports = {
  index: function(req, res) {
    res.render('index', {
      title: "Home",
      root: true,
      demoToken: Tokens.demoToken
    });
  },

  story: function(req, res) {
    res.render('story', { title: "Story" });
  },

  about: function(req, res) {
    res.render('about', { title: "About" });
  }
};
