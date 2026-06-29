const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Auth Controllers
const { registerUser, loginUser, getMe } = require('../controllers/authController');
// Password Reset Controllers
const { forgotPassword, verifyOTP, resetPassword } = require('../controllers/passwordResetController');

// Admin Controllers ← Imports Update kiya
const {
  getServices, addService, updateService, deleteService,
  getWorkingHours, updateWorkingHours,
  getAppointments, markComplete,
  adminBookAppointment, adminCancelAppointment, getDailyIncome,
  getMonthlyIncome, 
  getUpiSettings, updateUpiSettings, // ← Naye UPI Controllers Import add kiye
} = require('../controllers/adminController');

const guard = [protect, adminOnly];

// ==========================================
// AUTH & PASSWORD ROUTES (NEW ADDED)
// ==========================================

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Forgot password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// ==========================================
// ADMIN ROUTES (EXISTING)
// ==========================================

// Services
router.get('/services', guard, getServices);
router.post('/services', guard, addService);
router.put('/services/:id', guard, updateService);
router.delete('/services/:id', guard, deleteService);

// Working hours
router.get('/working-hours', guard, getWorkingHours);
router.put('/working-hours', guard, updateWorkingHours);

// Appointments
router.get('/appointments', guard, getAppointments);
router.put('/appointments/:id/complete', guard, markComplete);
router.post('/appointments/book', guard, adminBookAppointment);
router.delete('/appointments/:id', guard, adminCancelAppointment);

// Income Reports
router.get('/income/monthly', guard, getMonthlyIncome); 
router.get('/income', guard, getDailyIncome);

// UPI Settings Routes (New Section Added) 💳
router.get('/upi-settings', guard, getUpiSettings);
router.put('/upi-settings', guard, updateUpiSettings);

module.exports = router;