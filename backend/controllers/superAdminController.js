const { AdminRequest, User, Shop, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// =============================================
// ADMIN REQUESTS MANAGEMENT
// =============================================

// GET — Saari pending requests
const getAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.findAll({
      where: { status: 'pending' },
      attributes: ['id', 'name', 'email', 'status', 'shopId', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT — Request approve karo (FIXED WITH RAW QUERY & SHOP_ID)
const approveAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Raw query use kar rahe hain taaki hooks skip ho jayein aur password double-hash na ho
    await sequelize.query(
      `INSERT INTO users (name, email, password, role, shop_id, status, created_at, updated_at) 
       VALUES (?, ?, ?, 'admin', ?, 'active', NOW(), NOW())`,
      {
        replacements: [
          request.name,
          request.email,
          request.password,
          request.shopId,
        ],
      }
    );

    // Request status update
    request.status = 'approved';
    await request.save();

    res.json({ message: `${request.name} has been approved as Admin for Shop ID: ${request.shopId}!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT — Request reject karo
const rejectAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: `${request.name} request rejected successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// ADMINS USER MANAGEMENT
// =============================================

// GET — Saare admins (Updated to include status fields)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'shopId', 'status', 'suspendedReason', 'paymentDueDate', 'suspensionContact', 'createdAt'],
      include: [{ model: Shop, as: 'shop', attributes: ['name'] }]
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE — Admin remove karo (Admin -> Customer)
const removeAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Admin not found' });
    
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    user.role = 'customer';
    user.shopId = null; // Admin hata to shop access bhi hata diya
    await user.save();

    res.json({ message: `${user.name} removed admin access` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/superadmin/admins/:id/suspend — Naya function add kiya 🚫
const suspendAdmin = async (req, res) => {
  const { reason, paymentDueDate, contact } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'Cannot suspend superadmin' });

    user.status = 'suspended';
    user.suspendedReason = reason || 'Payment pending';
    user.paymentDueDate = paymentDueDate || null;
    user.suspensionContact = contact || null;
    await user.save();

    res.json({ message: `${user.name} suspended successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/superadmin/admins/:id/activate — Naya function add kiya ✅
const activateAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'active';
    user.suspendedReason = null;
    user.paymentDueDate = null;
    user.suspensionContact = null;
    await user.save();

    res.json({ message: `${user.name} activated successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// SHOP MANAGEMENT
// =============================================

// GET /api/superadmin/shops
const getShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'members',
        where: { role: 'admin' },
        attributes: ['id', 'name', 'email'],
        required: false,
      }],
    });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/superadmin/shops
const createShop = async (req, res) => {
  const { name, shopCode, location } = req.body;
  try {
    const exists = await Shop.findOne({ where: { shopCode } });
    if (exists) {
      return res.status(400).json({ message: 'This shop code already exists' });
    }

    const shop = await Shop.create({ name, shopCode, location });
    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/superadmin/shops/:id
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    await shop.destroy();
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exports mapping update ho gayi hai
module.exports = {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getAllAdmins,
  removeAdmin,
  getShops,
  createShop,
  deleteShop,
  suspendAdmin,
  activateAdmin,
};