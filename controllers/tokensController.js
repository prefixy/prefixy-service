const path = require('path');
const Tokens = require(path.resolve(path.dirname(__dirname), 'modules/tokens'));

module.exports = {
  show: function(req, res) {
    const token = req.params.token;

    try {
      Tokens.validate(token);
    } catch(e) {
      res.redirect('/');
      return;
    }

    res.render('token', { token, title: "Token" });
  },

  create: function(req, res) {
    const token = Tokens.generate();

    res.redirect('/tokens/' + token);
  }
};
