// ===== src/routes/messageRoutes.js =====
const express = require('express');
const {
  sendMessage,
  getMessages,
  getChats,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/send', sendMessage);
router.get('/chat/:chatId', getMessages);
router.get('/chats', getChats);
router.post('/read', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;