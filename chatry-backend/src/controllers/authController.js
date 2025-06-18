// ===== src/controllers/authController.js =====
const User = require('../models/User');
const { generateToken } = require('../config/auth');
const { validationResult } = require('express-validator');
const OTP = require('../models/OTP');
const { sendSMS } = require('../services/smsService');

// Send OTP for registration
const sendRegistrationOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Extract country code
    const countryCodeMatch = phone.match(/^\+\d{1,4}/);
    const countryCode = countryCodeMatch ? countryCodeMatch[0] : '+91';
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const fullPhone = countryCode + phone;
    
    // Check if already registered
    const existingUser = await User.findOne({ phone: fullPhone });
    if (existingUser && existingUser.isPhoneVerified) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    await OTP.findOneAndUpdate(
      { phone: fullPhone, purpose: 'registration' },
      { otp, attempts: 0 },
      { upsert: true, new: true }
    );
    
    // Send SMS (production)
    if (process.env.NODE_ENV === 'production') {
      await sendSMS(fullPhone, `Your Chatry verification code is: ${otp}`);
    } else {
      // Development: Log OTP
      console.log(`📱 OTP for ${fullPhone}: ${otp}`);
    }
    
    res.json({ 
      message: 'OTP sent successfully',
      phone: fullPhone,
      ...(process.env.NODE_ENV !== 'production' && { dev_otp: otp })
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify OTP and complete registration
const verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { phone, otp, name, username, password } = req.body;
    
    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      phone, 
      purpose: 'registration' 
    });
    
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }
    
    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ error: 'Too many attempts. Please request new OTP' });
    }
    
    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        error: 'Invalid OTP',
        attemptsLeft: 3 - otpRecord.attempts 
      });
    }
    
    // Check username availability
    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    // Create user
    const user = new User({
      name,
      username: username ? username.toLowerCase() : undefined,
      phone,
      password,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date()
    });
    
    await user.save();
    
    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      token
    });
    
  } catch (error) {
    next(error);
  }
};

// Login with phone and password
const login = async (req, res, next) => {
  try {
    const { phone, username, password } = req.body;

    let user;

    // Check if login is via username or phone
    if (username) {
      // Login with username
      user = await User.findOne({ 
        username: username.toLowerCase(),
        isPhoneVerified: true 
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else if (phone) {
      // Find user
      user = await User.findOne({ phone });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if phone is verified
      if (!user.isPhoneVerified) {
        return res.status(401).json({ error: 'Phone number not verified' });
      }
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
    
  } catch (error) {
    next(error);
  }
};

// const logout = async (req, res, next) => {
//   try {
//     const user = req.user;
    
//     // Update online status
//     user.isOnline = false;
//     user.lastSeen = new Date();
//     user.socketId = null;
//     await user.save();

//     res.json({ message: 'Logout successful' });
//   } catch (error) {
//     next(error);
//   }
// };

const logout = async (req, res, next) => {
  try {
    // Check if user exists (from auth middleware)
    if (!req.user) {
      // If no user, just return success (already logged out)
      return res.json({ message: 'Logout successful' });
    }

    const user = req.user;
    
    // Update online status
    user.isOnline = false;
    user.lastSeen = new Date();
    user.socketId = null;
    
    // Save changes - wrap in try-catch to handle any DB errors
    try {
      await user.save();
    } catch (saveError) {
      console.error('Error updating user status:', saveError);
      // Continue with logout even if save fails
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    // Always return success for logout to avoid blocking user
    res.json({ message: 'Logout successful' });
  }
};

module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  login,
  logout
};