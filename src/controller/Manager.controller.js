const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const MarketingManager = require('../models/MarketingManager.model.js');

// =============================================================================================
// 📥 Register Marketing Manager
// =============================================================================================
const registerManager = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      email,
      ifscCode,
      bankAccountNumber,
      bankName, // ✅ newly added
      pancardNumber,
      password
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = new MarketingManager({
      name,
      mobileNumber,
      email,
      ifscCode,
      bankAccountNumber,
      bankName, // ✅ added here too
      pancardNumber,
      password: hashedPassword
    });

    await newManager.save();

    const token = jwt.sign(
      { id: newManager._id, role: 'manager' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const managerData = newManager.toObject();
    delete managerData.password;

    res.status(201).json({
      message: 'Registered. Await admin approval.',
      token,
      manager: managerData
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =============================================================================================
// 🔐 Login Marketing Manager
// =============================================================================================
const loginManager = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const manager = await MarketingManager.findOne({ mobileNumber });
    if (!manager || !manager.isApproved)
      return res.status(401).json({ message: 'Unauthorized' });

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: manager._id, role: 'manager' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const managerData = manager.toObject();
    delete managerData.password;

    res.json({
      message: 'Login successful',
      token,
      manager: managerData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/marketingManagerController.js


const getAllManagers = async (req, res) => {
  try {
    const managers = await MarketingManager.find({}, 'name mobileNumber email');
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports = {
  registerManager,
  loginManager,
  getAllManagers
};
