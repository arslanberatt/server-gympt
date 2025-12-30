const { Router } = require('express');
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

// Chat endpoint (requires authentication)
router.post('/chat', requireAuth, chatController.chat);

module.exports = router;

