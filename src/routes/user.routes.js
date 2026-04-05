const router = require('express').Router();
const { getActivity } = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Protected routes
router.get('/activity', auth, getActivity);

module.exports = router;
