const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, superAdminOnly } = require('../middleware/adminMiddleware');
const {
  getAnnouncements,
  getBarberAnnouncements,
  getCustomerAnnouncements, // ← Naya Controller Function
  createAnnouncement,
  createBarberAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

// ==========================================
// SUPERADMIN ROUTES (Superadmin → Barbers)
// ==========================================
// Barbers/Admins fetch karenge, Superadmin create karega
router.get('/', protect, adminOnly, getAnnouncements);
router.post('/', protect, superAdminOnly, createAnnouncement);

// ==========================================
// BARBER ROUTES (Barber → Customers)
// ==========================================
// Barber apne announcements create karega
router.post('/barber', protect, adminOnly, createBarberAnnouncement);

// ==========================================
// CUSTOMER ROUTES (Login karte hi dashboard ke liye)
// ==========================================
// Ye route shop ke saare barbers ki announcements dikhayega
router.get('/customer', protect, getCustomerAnnouncements);

// Specific barber ke announcements (purana route agar use ho raha ho)
router.get('/barber', getBarberAnnouncements);

// ==========================================
// DELETE ROUTE
// ==========================================
// Superadmin sab delete kar sakta hai, Admin sirf apni
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;