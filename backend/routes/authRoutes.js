const express = require('express');
const router = express.Router();
// Purane controllers
const { registerUser, loginUser, getMe } = require('../controllers/authController');
// NAYE Password Reset controllers ko import karo
const { forgotPassword, verifyOTP, resetPassword } = require('../controllers/passwordResetController');
const { protect } = require('../middleware/authMiddleware');

// Standard Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// --- NAYE ROUTES JO MISSING THE ---
router.post('/forgot-password', forgotPassword); // Ye missing tha
router.post('/verify-otp', verifyOTP);           // Ye bhi missing tha
router.post('/reset-password', resetPassword);     // Ye bhi missing tha

module.exports = router;
// ```

// ---

// ## STEP 4 — API Test karo (Thunder Client)

// VS Code me **Thunder Client** kholo (left sidebar me lightning icon ⚡)

// ### Test 1 — Register
// ```
// Method : POST
// URL    : http://localhost:5000/api/auth/register
// Body   : JSON