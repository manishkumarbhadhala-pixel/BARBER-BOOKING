const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { superAdminOnly } = require('../middleware/adminMiddleware');
// Controllers import me dono naye suspension functions add kiye hain
const {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getAllAdmins,
  removeAdmin,
  getShops,
  createShop,
  deleteShop,
  suspendAdmin,   // ← Naya Import
  activateAdmin,  // ← Naya Import
} = require('../controllers/superAdminController');

const guard = [protect, superAdminOnly];

// --- Admin Requests ---
router.get('/requests', guard, getAdminRequests);
router.put('/requests/:id/approve', guard, approveAdminRequest);
router.put('/requests/:id/reject', guard, rejectAdminRequest);

// --- Admins Management ---
router.get('/admins', guard, getAllAdmins);
router.delete('/admins/:id', guard, removeAdmin);
// Account suspension ke naye routes 🚫 ✅
router.put('/admins/:id/suspend', guard, suspendAdmin);
router.put('/admins/:id/activate', guard, activateAdmin);

// --- Shops Management ---
router.get('/shops', guard, getShops);
router.post('/shops', guard, createShop);
router.delete('/shops/:id', guard, deleteShop);

module.exports = router;