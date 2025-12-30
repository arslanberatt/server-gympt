const { Router } = require('express');
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

// Chat endpoints (requires authentication)
router.post('/chat', requireAuth, chatController.chat);
router.get('/conversations', requireAuth, chatController.getConversations);
router.delete('/conversations/:conversationId', requireAuth, chatController.deleteConversation);

module.exports = router;

