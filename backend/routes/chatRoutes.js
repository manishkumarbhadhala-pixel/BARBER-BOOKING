const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, superAdminOnly } = require('../middleware/adminMiddleware');
const { getAdminList, getMessages, sendMessage, getSuperAdmin, getUnreadCount } = require('../controllers/chatController');

router.get('/admins', protect, superAdminOnly, getAdminList);
router.get('/superadmin-info', protect, adminOnly, getSuperAdmin);
router.get('/unread-count', protect, adminOnly, getUnreadCount);

// Admin routes
router.get('/messages/:withUserId', protect, adminOnly, getMessages);
router.post('/send', protect, adminOnly, sendMessage);

// SuperAdmin routes — adminOnly ki jagah superAdminOnly
router.get('/superadmin/messages/:withUserId', protect, superAdminOnly, getMessages);
router.post('/superadmin/send', protect, superAdminOnly, sendMessage);
router.get('/superadmin/unread-count', protect, superAdminOnly, getUnreadCount);

module.exports = router;