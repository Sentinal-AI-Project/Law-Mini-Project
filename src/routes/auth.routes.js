const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);

module.exports = router;
