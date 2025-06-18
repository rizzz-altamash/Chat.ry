// ===== src/routes/contactRoutes.js =====
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { syncContacts, searchByUsername } = require('../controllers/contactController');

router.use(authenticate); // All routes need auth

router.post('/sync', syncContacts);
router.get('/search', searchByUsername);

module.exports = router;