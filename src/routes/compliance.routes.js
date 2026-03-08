const router = require('express').Router();
const auth = require('../middleware/auth');
const {
    listPolicies,
    createPolicy,
    getDashboard,
    checkCompliance,
} = require('../controllers/compliance.controller');

// All routes require authentication
router.get('/policies', auth, listPolicies);
router.post('/policies', auth, createPolicy);     // Admin only (checked in controller)
router.get('/dashboard', auth, getDashboard);
router.get('/check/:docId', auth, checkCompliance);

module.exports = router;
