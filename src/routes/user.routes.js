const router = require('express').Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Protected routes
router.get('/activity', auth, userController.getActivity);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
