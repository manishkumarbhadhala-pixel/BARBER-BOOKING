const { Note, QuickNote } = require('../models'); // ← QuickNote model add kiya

// GET /api/notes — Apne saare notes lo
const getNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/notes — Naya note banao
const createNote = async (req, res) => {
  const { title, note } = req.body;
  try {
    if (!title?.trim()) return res.status(400).json({ message: 'Title required' });
    const newNote = await Note.create({
      title: title.trim(),
      note: note?.trim() || null,
      userId: req.user.id,
    });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notes/:id/toggle — Complete/Incomplete toggle
const toggleNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isCompleted = !note.isCompleted;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notes/:id — Note delete karo
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET quick note — Naya function
const getQuickNote = async (req, res) => {
  try {
    const qn = await QuickNote.findOne({ where: { userId: req.user.id } });
    res.json({ content: qn?.content || '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT quick note — save/update — Naya function
const saveQuickNote = async (req, res) => {
  const { content } = req.body;
  try {
    let qn = await QuickNote.findOne({ where: { userId: req.user.id } });
    if (qn) {
      qn.content = content;
      await qn.save();
    } else {
      qn = await QuickNote.create({ content, userId: req.user.id });
    }
    res.json({ content: qn.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exports update kiye hain
module.exports = { getNotes, createNote, toggleNote, deleteNote, getQuickNote, saveQuickNote };