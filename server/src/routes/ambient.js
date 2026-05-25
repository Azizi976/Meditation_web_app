const router = require('express').Router();
const { list } = require('../controllers/ambientController');

router.get('/', list);

module.exports = router;
