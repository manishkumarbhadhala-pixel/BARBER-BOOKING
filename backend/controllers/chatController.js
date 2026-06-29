const { Message, User } = require('../models');
const { Op } = require('sequelize');

// SuperAdmin ke liye — saare admins ki list + last message + unread count
const getAdminList = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email'],
    });

    // Har admin ke saath last message aur unread count lo
    const adminList = await Promise.all(admins.map(async (admin) => {
      const lastMsg = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: req.user.id, receiverId: admin.id },
            { senderId: admin.id, receiverId: req.user.id },
          ],
        },
        order: [['createdAt', 'DESC']],
      });

      const unread = await Message.count({
        where: {
          senderId: admin.id,
          receiverId: req.user.id,
          isRead: false,
        },
      });

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        lastMessage: lastMsg?.message || null,
        lastTime: lastMsg?.createdAt || null,
        unread,
      };
    }));

    res.json(adminList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dono ke liye — conversation fetch karo
const getMessages = async (req, res) => {
  try {
    const { withUserId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: req.user.id },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    // Sirf jo messages mere liye aaye hain unhe read mark karo
    await Message.update(
      { isRead: true },
      { 
        where: { 
          senderId: withUserId, 
          receiverId: req.user.id, 
          isRead: false 
        } 
      }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Message bhejo
const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  try {
    if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

    const msg = await Message.create({
      senderId: req.user.id,
      receiverId,
      message: message.trim(),
    });

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin ke liye — superadmin ka id lo
const getSuperAdmin = async (req, res) => {
  try {
    const superadmin = await User.findOne({
      where: { role: 'superadmin' },
      attributes: ['id', 'name'],
    });
    res.json(superadmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.count({
      where: { receiverId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminList, getMessages, sendMessage, getSuperAdmin, getUnreadCount };