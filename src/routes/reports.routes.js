const router = require('express').Router();
const auth = require('../middleware/auth');
const {
    generate,
    listReports,
    getReport,
} = require('../controllers/reports.controller');

// All routes require authentication
router.post('/generate', auth, generate);
router.get('/', auth, listReports);
router.get('/:id', auth, getReport);

module.exports = router;
