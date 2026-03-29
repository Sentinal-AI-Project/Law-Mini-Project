const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body, validationResult } = require('express-validator');

const {
    listPolicies,
    createPolicy,
    getDashboard,
    checkCompliance,
} = require('../controllers/compliance.controller');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Input validation failed', errors: errors.array() });
  }
  next();
};

// All routes require authentication
router.get('/policies', auth, listPolicies);

// Only Admins can create policies
router.post(
  '/policies',
  auth,
  authorize('admin'),
  [
    body('name', 'Policy name is required').not().isEmpty(),
    body('framework', 'Framework is required').not().isEmpty(),
  ],
  validate,
  createPolicy
);

router.get('/dashboard', auth, getDashboard);
router.get('/check/:docId', auth, checkCompliance);

module.exports = router;
