const router = require('express').Router();
const auth = require('../middleware/auth');
const {
    listFindings,
    getFinding,
    getStats,
    updateFinding,
    generateFixSuggestion,
} = require('../controllers/findings.controller');

// All routes require authentication
router.get('/stats', auth, getStats);       // Must be before /:id to avoid conflict
router.get('/', auth, listFindings);
router.get('/:id', auth, getFinding);
router.patch('/:id', auth, updateFinding);
router.post('/:id/generate-fix', auth, generateFixSuggestion);

module.exports = router;
