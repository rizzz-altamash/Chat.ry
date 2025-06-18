// ===== src/routes/authRoutes.js =====
const express = require('express');
const { body } = require('express-validator');
const { sendRegistrationOTP, verifyRegistrationOTP, login, logout } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .matches(/^[0-9+\-\s]+$/).withMessage('Invalid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public route - no authentication needed
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Basic validation
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters',
        available: false 
      });
    }
    
    // Check format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        error: 'Invalid username format',
        available: false 
      });
    }
    
    // Check if username exists
    const existingUser = await User.findOne({ 
      username: username.toLowerCase() 
    });
    
    res.json({ 
      available: !existingUser,
      username: username.toLowerCase()
    });
    
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ 
      error: 'Failed to check username',
      available: false 
    });
  }
});

// Routes
router.post('/login', loginValidation, login);
router.post('/logout', authenticate, logout);
router.post('/send-otp', sendRegistrationOTP);
router.post('/verify-otp', verifyRegistrationOTP);

module.exports = router;