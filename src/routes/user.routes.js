const router = require('express').Router();
const multer = require('multer');
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Multer: memory storage, images only, 5 MB max
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'));
    }
  },
});

// Protected routes
router.get('/activity', auth, userController.getActivity);
router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, avatarUpload.single('avatar'), userController.uploadAvatar);

module.exports = router;
