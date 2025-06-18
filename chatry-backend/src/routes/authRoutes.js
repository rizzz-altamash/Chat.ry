// ===== src/routes/authRoutes.js =====
const express = require('express');
const { body } = require('express-validator');
const { sendRegistrationOTP, verifyRegistrationOTP, login, logout } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

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

// Routes
// router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', authenticate, logout);
router.post('/send-otp', sendRegistrationOTP);
router.post('/verify-otp', verifyRegistrationOTP);

module.exports = router;