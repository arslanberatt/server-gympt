const { Router } = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

// All routes require authentication
router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, userController.updateMe);

// Nutrition routes
router.get('/me/nutrition', requireAuth, userController.getNutrition);
router.post('/me/nutrition', requireAuth, userController.addNutrition);
router.put('/me/nutrition/:date', requireAuth, userController.updateNutrition);

module.exports = router;

