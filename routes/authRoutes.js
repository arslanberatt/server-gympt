const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

// API routes only (no view routes)
router.post('/signup', authController.signup_post);
router.post('/login', authController.login_post);
router.post('/logout', authController.logout_post || ((req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
}));

module.exports = router;