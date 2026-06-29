const { Announcement, User } = require('../models');

// GET — Superadmin announcements (Admins ke liye)
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { isActive: true, type: 'superadmin' },
      include: [{ model: User, as: 'creator', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET — Barber announcements (barberId se filter)
const getBarberAnnouncements = async (req, res) => {
  try {
    const { barberId } = req.query;
    if (!barberId) {
      return res.status(400).json({ message: 'Barber ID required' });
    }
    const announcements = await Announcement.findAll({
      where: { isActive: true, type: 'barber', barberId },
      include: [{ model: User, as: 'creator', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET — Customer ke liye — Us shop ke saare barbers ke announcements
const getCustomerAnnouncements = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    if (!shopId) {
      return res.json([]);
    }

    // Us shop ke saare barbers lo
    const barbers = await User.findAll({
      where: { 
        shopId, 
        role: ['admin', 'superadmin'] 
      },
      attributes: ['id'],
    });

    const barberIds = barbers.map(b => b.id);

    if (barberIds.length === 0) return res.json([]);

    // Un barbers ke saare active announcements lo
    const announcements = await Announcement.findAll({
      where: {
        isActive: true,
        type: 'barber',
        barberId: barberIds,
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['name'], // Barber ka naam
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST — Superadmin announcement
const createAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  try {
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message required' });
    }
    const announcement = await Announcement.create({
      title, message,
      createdBy: req.user.id,
      type: 'superadmin',
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST — Barber announcement
const createBarberAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  try {
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message required' });
    }
    const announcement = await Announcement.create({
      title, message,
      createdBy: req.user.id,
      barberId: req.user.id,
      type: 'barber',
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    if (req.user.role === 'admin' && announcement.barberId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await announcement.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  getBarberAnnouncements,
  getCustomerAnnouncements,
  createAnnouncement,
  createBarberAnnouncement,
  deleteAnnouncement,
};