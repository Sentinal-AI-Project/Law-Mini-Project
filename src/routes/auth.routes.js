const router = require('express').Router();
const { register, login, getMe, changePassword, deleteAccount } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Input validation failed', errors: errors.array() });
  }
  next();
};

// Public routes
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  validate,
  login
);

// Protected routes
router.get('/me', auth, getMe);

router.post(
  '/change-password',
  auth,
  [
    body('oldPassword', 'Current password is required').not().isEmpty(),
    body('newPassword', 'Please enter a new password with 8 or more characters').isLength({ min: 8 }),
  ],
  validate,
  changePassword
);

router.delete('/account', auth, deleteAccount);


module.exports = router;
