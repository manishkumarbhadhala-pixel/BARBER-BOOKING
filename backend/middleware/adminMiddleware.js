// backend/middleware/adminMiddleware.js

// UPDATED: Admin ya Superadmin dono allow hain
// (Taki Super Admin bhi services manage kar sake)
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next(); // Admin ya Superadmin h, jaane do
  } else {
    res.status(403).json({ message: 'Only admin can perform this action!' });
  }
};

// NEW: Sirf Superadmin ke liye (Jaise ki Admin Requests approve karna)
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next(); // Sirf Superadmin h, tabhi jaane do
  } else {
    res.status(403).json({ message: 'Only Super Admin can perform this action!' });
  }
};

module.exports = { adminOnly, superAdminOnly };