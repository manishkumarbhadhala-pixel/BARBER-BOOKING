const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Service, WorkingHours, User, Shop } = require('../models');

// GET /api/user/services?barberId=1
router.get('/services', async (req, res) => {
  try {
    const { barberId } = req.query;
    const where = barberId ? { barberId } : {};
    const services = await Service.findAll({ where });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/working-hours?barberId=1
router.get('/working-hours', async (req, res) => {
  try {
    const { barberId } = req.query;
    const where = barberId ? { barberId } : {};
    const hours = await WorkingHours.findOne({ where });
    res.json(hours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/barbers?shopId=1
// ✅ FIX: Sirf 'admin' role wale barbers, superadmin nahi
router.get('/barbers', async (req, res) => {
  try {
    const { shopId } = req.query;

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    const barbers = await User.findAll({
      where: { 
        role: 'admin',      // ✅ Sirf admin — superadmin hata diya
        shopId: shopId,
      },
      attributes: ['id', 'name', 'email'],
    });
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/verify-shop?shopCode=NIT2024
// ✅ FIX: shopCode column name explicitly diya
router.get('/verify-shop', async (req, res) => {
  try {
    const { shopCode } = req.query;

    if (!shopCode) {
      return res.status(400).json({ message: 'Shop code is required' });
    }

    const shop = await Shop.findOne({ 
      where: { shopCode: shopCode.toUpperCase() }, // ✅ Uppercase normalize
      attributes: ['id', 'name', 'shopCode', 'location'],
    });

    if (!shop) {
      return res.status(404).json({ message: 'Invalid shop code' });
    }

    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/upi-check?barberId=1
// Naya route add kiya — customer check karega UPI enabled hai ya nahi 💳
router.get('/upi-check', async (req, res) => {
  try {
    const { barberId } = req.query;
    if (!barberId) return res.status(400).json({ message: 'barberId required' });
    
    const barber = await User.findByPk(barberId, {
      attributes: ['upiId', 'upiEnabled'],
    });
    
    res.json({
      upiEnabled: barber?.upiEnabled || false,
      upiId: barber?.upiEnabled ? barber.upiId : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;