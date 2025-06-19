// ===== src/routes/groupRoutes.js =====
const express = require('express');
const {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMembers,
  removeGroupMember,
  updateGroup,
  reportGroupMember,
  updateGroupSettings,
  makeAdmin,
  removeAdmin
} = require('../controllers/groupController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/create', createGroup);
router.get('/', getGroups);
router.get('/:groupId/messages', getGroupMessages);
router.post('/message', sendGroupMessage);
router.post('/:groupId/members', addGroupMembers);
router.delete('/:groupId/members/:memberId', removeGroupMember);
router.put('/:groupId', updateGroup);
router.post('/:groupId/report/:memberId', reportGroupMember);
router.put('/:groupId/settings', updateGroupSettings);
router.post('/:groupId/admin/:memberId', makeAdmin);
router.delete('/:groupId/admin/:memberId', removeAdmin);

module.exports = router;