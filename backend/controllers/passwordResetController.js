const { User, PasswordReset } = require('../models');
const { sendOTPEmail } = require('../config/mailer');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// 6 digit random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // User exist karta h?
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Purana OTP delete karo
    await PasswordReset.destroy({ where: { email } });

    // Naya OTP banao
    const otp = generateOTP();

    // 10 minute baad expire hoga
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // DB me save karo
    await PasswordReset.create({ email, otp, expiresAt });

    // Email bhejo
    await sendOTPEmail(email, otp, user.name);

    res.json({ message: 'OTP has been sent to your email address!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await PasswordReset.findOne({
      where: {
        email,
        otp,
        expiresAt: { [Op.gt]: new Date() }, // Expire nahi hua ho
      },
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully!', verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // OTP verify karo
    const record = await PasswordReset.findOne({
      where: {
        email,
        otp,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Password update karo
    const user = await User.findOne({ where: { email } });
    user.password = newPassword; // Model hook hash karega
    await user.save();

    // OTP delete karo
    await PasswordReset.destroy({ where: { email } });

    res.json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { forgotPassword, verifyOTP, resetPassword };