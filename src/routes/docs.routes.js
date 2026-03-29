const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const {
    upload,
    analyze,
    getFindings,
    listDocuments,
    getDocument,
} = require('../controllers/docs.controller');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept common document types
    const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
};

const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});

// All routes require authentication
router.get('/', auth, listDocuments);
router.get('/:id', auth, getDocument);
router.post('/upload', auth, uploadMiddleware.single('file'), upload);
router.post('/:id/analyze', auth, analyze);
router.get('/:id/findings', auth, getFindings);

module.exports = router;
