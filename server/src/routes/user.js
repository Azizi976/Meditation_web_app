const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const {
  getFavorites, addFavorite, removeFavorite,
  getProgress, upsertProgress,
  getPreferences, updatePreferences,
} = require('../controllers/userController');

router.use(authenticate);

router.get('/favorites',                getFavorites);
router.post('/favorites/:id',           addFavorite);
router.delete('/favorites/:id',         removeFavorite);

router.get('/progress',                 getProgress);
router.post('/progress/:id',            upsertProgress);

router.get('/preferences',              getPreferences);
router.put('/preferences',              updatePreferences);

module.exports = router;
