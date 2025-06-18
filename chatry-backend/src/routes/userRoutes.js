// ===== src/routes/userRoutes.js =====
const express = require('express');
const {
  getProfile,
  updateProfile,
  searchUsers,
  addContact,
  getContacts,
  blockUser,
  unblockUser
} = require('../controllers/userController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/search', searchUsers);
router.post('/contacts', addContact);
router.get('/contacts', getContacts);
router.post('/block', blockUser);
router.post('/unblock', unblockUser);

module.exports = router;