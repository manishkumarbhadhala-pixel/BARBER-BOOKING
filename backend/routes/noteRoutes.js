const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
// Controllers import me dono naye functions add kiye hain
const { getNotes, createNote, toggleNote, deleteNote, getQuickNote, saveQuickNote } = require('../controllers/noteController');

// adminOnly middleware admin + superadmin dono allow karta hai already ✅
const guard = [protect, adminOnly];

router.get('/', guard, getNotes);
router.post('/', guard, createNote);
router.put('/:id/toggle', guard, toggleNote);
router.delete('/:id', guard, deleteNote);

// Quick Note ke naye routes 📄
router.get('/quick', guard, getQuickNote);
router.put('/quick', guard, saveQuickNote);

module.exports = router;