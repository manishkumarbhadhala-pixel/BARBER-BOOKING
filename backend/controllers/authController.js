const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, AdminRequest, Shop } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ---- REGISTER ----
const registerUser = async (req, res) => {
  const { name, email, password, role, shopCode } = req.body;

  try {
    // ---- Customer Register ----
    if (role === 'customer') {
      if (!shopCode) {
        return res.status(400).json({ message: 'Shop code is required' });
      }

      const shop = await Shop.findOne({ where: { shopCode } });
      if (!shop) {
        return res.status(404).json({ message: 'Invalid shop code' });
      }

      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: 'This email is already registered' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: 'customer',
        shopId: shop.id,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId,
        shopName: shop.name,
        token: generateToken(user.id),
      });
    }

    // ---- Admin Request ----
    // if (role === 'admin') {
    //   if (!shopCode) {
    //     return res.status(400).json({ message: 'Shop code is required for admin' });
    //   }

    //   const shop = await Shop.findOne({ where: { shopCode } });
    //   if (!shop) {
    //     return res.status(404).json({ message: 'Invalid shop code' });
    //   }

    //   const requestExists = await AdminRequest.findOne({ where: { email } });
    //   if (requestExists) {
    //     return res.status(400).json({ message: 'A request already exists for this email' });
    //   }

    //   const userExists = await User.findOne({ where: { email } });
    //   if (userExists) {
    //     return res.status(400).json({ message: 'This email is already registered' });
    //   }

    //   const salt = await bcrypt.genSalt(10);
    //   const hashedPassword = await bcrypt.hash(password, salt);

    //   await AdminRequest.create({ 
    //     name, 
    //     email, 
    //     password: hashedPassword,
    //     shopId: shop.id,
    //   });

    //   return res.status(201).json({ 
    //     message: 'Admin request sent! Please wait for Super Admin approval.' 
    //   });
    // }

    //--------------
    // ---- Admin Request ---- ye poora block replace karo:
if (role === 'admin') {
  if (!shopCode) {
    return res.status(400).json({ message: 'Shop code is required for admin' });
  }

  const shop = await Shop.findOne({ where: { shopCode } });
  if (!shop) {
    return res.status(404).json({ message: 'Invalid shop code' });
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({ message: 'This email is already registered' });
  }

  // APPROVAL BYPASS — Direct admin create karo
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    shopId: shop.id,
  });

  return res.status(201).json({
    message: 'Admin account created successfully! You can now login.'
  });
}

//--------------------------------------------------

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- FIXED: LOGIN FUNCTION ----
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { email },
      include: [{ 
        model: Shop, 
        as: 'shop', 
        attributes: ['id', 'name', 'shopCode', 'location'],
        required: false, // superadmin ke liye shop null ho sakta hai
      }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId || null,
      shopName: user.shop?.name || null,
      shopCode: user.shop?.shopCode || null,
      token: generateToken(user.id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET ME ----
const getMe = async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    shopId: req.user.shopId,
  });
};

module.exports = { registerUser, loginUser, getMe };




