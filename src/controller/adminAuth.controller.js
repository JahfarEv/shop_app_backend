const adminModel = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { info, error, debug } = require("../middleware/logger");
const Salesman = require("../models/Salesman.model");
const MarketingManager = require("../models/MarketingManager.model");
const SalesmanCommissionSettings = require("../models/salesmanCommisionSettings");
const ManagerCommisionSettings = require("../models/managerCommisionSettings")

const handleAdminRegister = async (req, res) => {
  try {
    const { name, email, mobileNumber } = req.body;

    debug(`Admin registration attempt: ${email || mobileNumber}`);

    if (!req.body.password) {
      info(
        `Registration failed: Missing password for ${email || mobileNumber}`
      );
      return res.status(400).json({ message: "Password is required" });
    }

    const existingAdmin = await adminModel.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingAdmin) {
      info(
        `Registration failed: Admin already exists - ${email || mobileNumber}`
      );
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const adminData = { name, password: hashedPassword };

    if (email) adminData.email = email;
    if (mobileNumber) adminData.mobileNumber = mobileNumber;

    const newAdmin = await adminModel.create(adminData);

    const token = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    info(
      `Admin registered successfully: ${email || mobileNumber} (ID: ${
        newAdmin._id
      })`
    );
    return res.status(201).json({ message: "Admin registered", token });
  } catch (error) {
    error(`Admin registration error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

const handleAdminLogin = async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;

    debug(`Admin login attempt: ${email || mobileNumber}`);

    if (!req.body.password) {
      info(`Login failed: Missing password for ${email || mobileNumber}`);
      return res.status(400).json({ message: "Password is required" });
    }

    const admin = await adminModel.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (!admin) {
      info(`Login failed: Admin not found - ${email || mobileNumber}`);
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, admin.password);

    if (!isMatch) {
      info(`Login failed: Invalid credentials for ${email || mobileNumber}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    const { password: _, ...adminDetails } = admin.toObject();

    info(`Admin login successful: ${email || mobileNumber} (ID: ${admin._id})`);
    return res.status(200).json({
      message: "Login successful",
      token,
      admin: adminDetails,
    });
  } catch (err) {
    error(`Admin login error: ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

// =============================================================================================
// 🎯 Assign or Update Agent Code to Salesman
// =============================================================================================
const assignAgentCodeToSalesman = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentCode } = req.body;

    if (!agentCode) {
      return res.status(400).json({ message: "Agent code is required" });
    }

    const updatedSalesman = await Salesman.findByIdAndUpdate(
      id,
      { agentCode },
      { new: true }
    );

    if (!updatedSalesman) {
      return res.status(404).json({ message: "Salesman not found" });
    }

    res.status(200).json({
      message: "Agent code assigned successfully",
      updatedSalesman,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================================================
// ✅ Approve Marketing Manager
// =============================================================================================
const approveManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const updated = await MarketingManager.findByIdAndUpdate(
      managerId,
      { isApproved: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Manager not found" });

    res.json({ message: "Manager approved successfully", manager: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================================================
// ✅ Approve Salesman
// =============================================================================================
const approveSalesman = async (req, res) => {
  try {
    const { salesmanId } = req.params;
    const updated = await Salesman.findByIdAndUpdate(
      salesmanId,
      { isApproved: true },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Salesman not found" });

    res.json({ message: "Salesman approved successfully", salesman: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const setSalesmanCommission = async (req, res) => {
  const { amount, salesTarget, subscriptionCommission } = req.body;

  try {
    let settings = await SalesmanCommissionSettings.findOne();

    // If no document exists, create one
    if (!settings) {
      settings = new SalesmanCommissionSettings();
    }

    // Update fields if provided
    if (amount !== undefined) settings.salesCommission = amount;
    if (salesTarget !== undefined) settings.salesTarget = salesTarget;
    if (subscriptionCommission !== undefined) settings.subscriptionCommission = subscriptionCommission;

    settings.updatedAt = new Date();

    await settings.save();

    res.status(200).json({
      message: "Salesman commission settings updated successfully",
      updatedSettings: {
        salesmanCommission: settings.salesmanCommission,
        salesTarget: settings.salesTarget,
        subscriptionCommission: settings.subscriptionCommission,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating salesman commission settings",
      error: err.message,
    });
  }
};



const setManagerCommission = async (req, res) => {
 const { amount, salesTarget, subscriptionCommission } = req.body;

  try {
    let settings = await ManagerCommisionSettings.findOne();

    // If no document exists, create one
    if (!settings) {
      settings = new ManagerCommisionSettings();
    }

    // Update fields if provided
    if (amount !== undefined) settings.salesCommission = amount;
    if (salesTarget !== undefined) settings.salesTarget = salesTarget;
    if (subscriptionCommission !== undefined) settings.subscriptionCommission = subscriptionCommission;

    settings.updatedAt = new Date();

    await settings.save();

    res.status(200).json({
      message: "Salesman commission settings updated successfully",
      updatedSettings: {
        salesmanCommission: settings.salesmanCommission,
        salesTarget: settings.salesTarget,
        subscriptionCommission: settings.subscriptionCommission,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating salesman commission settings",
      error: err.message,
    });
  }
};




const getSalesmanCommission = async (req, res) => {
  try {
    const settings = await SalesmanCommissionSettings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Salesman commission not found" });
    }

   res.status(200).json({
      message: "Salesman commission settings fetched successfully",
      settings: {
        salesmanCommission: settings.salesCommission,
        salesTarget: settings.salesTarget,
        subscriptionCommission: settings.subscriptionCommission,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching salesman commission settings",
      error: err.message,
    });
  }
};

const getManagerCommission = async (req, res) => {
  try {
    const settings = await ManagerCommisionSettings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Salesman commission not found" });
    }

   res.status(200).json({
      message: "Salesman commission settings fetched successfully",
      settings: {
        managerCommission: settings.salesCommission,
        salesTarget: settings.salesTarget,
        subscriptionCommission: settings.subscriptionCommission,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching salesman commission settings",
      error: err.message,
    });
  }
};

module.exports = {
  handleAdminRegister,
  handleAdminLogin,
  assignAgentCodeToSalesman,
  approveManager,
  approveSalesman,
  setSalesmanCommission,
  setManagerCommission,
  getSalesmanCommission,
  getManagerCommission
};
