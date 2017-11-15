var express = require('express');
const path = require("path");
var router = express.Router();

const indexController = require(path.resolve(path.dirname(__dirname), "controllers/indexController.js"));
const tokensController = require(path.resolve(path.dirname(__dirname), "controllers/tokensController.js"));

router.get('/', indexController.index);
router.get('/story', indexController.story);
router.get('/about', indexController.about);

router.get('/tokens/:token', tokensController.show);
router.post('/tokens', tokensController.create);

module.exports = router;
