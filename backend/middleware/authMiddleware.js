const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  // Header me token check karo
  if (req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')) {
    
    try {
      // "Bearer abc123" se sirf "abc123" lo
      token = req.headers.authorization.split(' ')[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User DB se lo, password chhod ke
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      // Suspended check — Superadmin ko exempt (allow) karo baki sabko block
      if (req.user.status === 'suspended' && req.user.role !== 'superadmin') {
        return res.status(403).json({ 
          message: 'Account suspended',
          suspended: true,
          reason: req.user.suspendedReason,
          contact: req.user.suspensionContact,
          paymentDueDate: req.user.paymentDueDate,
        });
      }

      next(); // Safe h, aage badho
    } catch (error) {
      res.status(401).json({ message: 'Invalid token, please login again' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Please login first, no token found' });
  }
};

module.exports = { protect };