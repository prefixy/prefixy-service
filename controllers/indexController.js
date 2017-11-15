module.exports = {
  index: function(req, res) {
    res.render('index');
  },

  story: function(req, res) {
    res.render('story');
  },

  about: function(req, res) {
    res.render('about');
  }
};
