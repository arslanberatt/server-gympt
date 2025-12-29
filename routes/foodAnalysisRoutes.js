const { Router } = require('express');
const multer = require('multer');
const foodAnalysisController = require('../controllers/foodAnalysisController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

// Configure multer for memory storage (no file saving)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Food analysis endpoint (requires authentication)
router.post('/analyze', requireAuth, upload.single('image'), foodAnalysisController.analyzeFood);

module.exports = router;

