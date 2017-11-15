module.exports = {
  show: function(req, res) {
    const token = req.params.token;

    // TODO: check with Prefixy that token is valid and redirect if invalid

    res.render('token', { token });
  },

  create: function(req, res) {
    // TODO: send request to prefixy to get new token

    // temporarily hard coded
    const token = 'tenant';

    res.redirect('/tokens/' + token);
  }
};
