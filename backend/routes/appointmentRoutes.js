const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAvailableSlots,
  getAllBusySlots,
  bookAppointment,
  getMyAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');

// Available slots — login zaroori
router.get('/available-slots', protect, getAvailableSlots);

// Busy slots — public, bina login ke bhi dekh sakte h
router.get('/all-busy-slots', getAllBusySlots);

// Booking karo — login zaroori
router.post('/book', protect, bookAppointment);

// Apni booking dekho — login zaroori
router.get('/my-appointment', protect, getMyAppointment);

// Cancel karo — login zaroori
router.delete('/:id/cancel', protect, cancelAppointment);

module.exports = router;
// ```

// ---

// ## STEP 2 — Thunder Client se Test karo

// Pehle **Customer account banao:**

// ### Test 1 — Customer Register karo
// ```
// Method : POST
// URL    : http://localhost:5000/api/auth/register
// Body (JSON):