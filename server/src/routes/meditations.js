const router = require('express').Router();
const { list, getById, getCategories } = require('../controllers/meditationController');

router.get('/',           list);
router.get('/categories', getCategories);
router.get('/:id',        getById);

module.exports = router;
