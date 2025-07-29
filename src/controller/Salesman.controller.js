const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const MarketingManager = require('../models/MarketingManager.model');
const Salesman = require('../models/Salesman.model');
const Shop = require('../models/storeModel');

// =============================================================================================
// 📥 Register Salesman
// =============================================================================================
// const registerSalesman = async (req, res) => {
//   try {
//     const {
//       name,
//       mobileNumber,
//       email,
//       ifscCode,
//       bankAccountNumber,
//       bankName,          // ✅ newly added
//       password,
//       managerMobile,
//       managerName,
      
//     } = req.body;

//     const agentCode = `AG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const salesmanData = {
//       name,
//       mobileNumber,
//       email,
//       ifscCode,
//       bankAccountNumber,
//       bankName,          // ✅ added to data
//       password: hashedPassword,
//       agentCode: [agentCode] // storing as array
//     };

//     let assignedManager = null;

//     // 🔗 Link manager if both mobile and name are provided
//     if (managerMobile && managerName) {
//       const mgr = await MarketingManager.findOne({
//         mobileNumber: managerMobile,
//         name: managerName,
//         isApproved: true
//       });

//       if (mgr) {
//         salesmanData.manager = mgr._id;
//         assignedManager = mgr;
//       }
//     }

//     // 💾 Save salesman
//     const newSalesman = new Salesman(salesmanData);
//     await newSalesman.save();

//     // 📎 If manager assigned, push this salesman to their assignedSalesmen list
//     if (assignedManager) {
//       assignedManager.assignedSalesmen.push(newSalesman._id);
//       await assignedManager.save();
//     }

//     const token = jwt.sign({ id: newSalesman._id, role: 'salesman' }, process.env.JWT_SECRET, { expiresIn: '8h' });

//     const salesmanResponse = newSalesman.toObject();
//     delete salesmanResponse.password;

//     res.status(201).json({
//       message: 'Registered. Await admin approval.',
//       token,
//       salesman: salesmanResponse
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


const registerSalesman = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      email,
      ifscCode,
      bankAccountNumber,
      bankName,
      pancardNumber,
      password,
      managerId, // ✅ optional manager ID
    } = req.body;

    const agentCode = `AG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const salesmanData = {
      name,
      mobileNumber,
      email,
      ifscCode,
      bankAccountNumber,
      bankName,
      pancardNumber,
      password: hashedPassword,
      agentCode: [agentCode],
    };

    let assignedManager = null;

    // If managerId is provided, validate it and assign
    if (managerId) {
      const mgr = await MarketingManager.findOne({
        _id: managerId,
        // isApproved: true,
      });

      if (mgr) {
        salesmanData.manager = mgr._id;
        assignedManager = mgr;
      }
    }

    const newSalesman = new Salesman(salesmanData);
    await newSalesman.save();

    // Add salesman to manager's list if assigned
    if (assignedManager) {
      assignedManager.assignedSalesmen.push(newSalesman._id);
      await assignedManager.save();
    }

    const token = jwt.sign(
      { id: newSalesman._id, role: 'salesman' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const salesmanResponse = newSalesman.toObject();
    delete salesmanResponse.password;

    res.status(201).json({
      message: 'Registered. Await admin approval.',
      token,
      salesman: salesmanResponse,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// =============================================================================================
// 🔐 Login Salesman
// =============================================================================================
const loginSalesman = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const salesman = await Salesman.findOne({ mobileNumber });
    if (!salesman || !salesman.isApproved)
      return res.status(401).json({ message: 'Unauthorized' });

    const isMatch = await bcrypt.compare(password, salesman.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: salesman._id, role: 'salesman' }, process.env.JWT_SECRET, { expiresIn: '8h' });

    const salesmanResponse = salesman.toObject();
    delete salesmanResponse.password;

    res.json({
      message: 'Login successful',
      token,
      salesman: salesmanResponse
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const getSalesmanById = async (req, res) => {

//   const { id } = req.params;

//   try {
//     // 🔍 Find salesman by ID and populate manager and shops
//     const salesman = await Salesman.findById(id)
//       .populate('manager', 'name mobileNumber email') // Populate manager details
//       .populate('shopsAddedBySalesman', 'name location'); // Optional

//     if (!salesman) {
//       return res.status(404).json({ message: 'Salesman not found' });
//     }

//     const salesmanData = salesman.toObject();
//     delete salesmanData.password; // 🔐 Hide sensitive info

//     res.status(200).json({
//       message: 'Salesman details fetched successfully',
//       salesman: salesmanData
//     });

//   } catch (err) {
//     res.status(400).json({
//       message: 'Invalid salesman ID or server error',
//       error: err.message
//     });
//   }
// };




const getSalesmanById = async (req, res) => {
  const { id } = req.params;

  try {
    const salesman = await Salesman.findById(id)
      .populate('manager', 'name mobileNumber email')
      .populate({
        path: 'salesCommissionEarned.shop',
        select: 'shopName place locality'
      });

    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }

    const salesmanData = salesman.toObject();

    // 🔐 Remove sensitive data
    delete salesmanData.password;

    // 💰 Calculate total commission earned
    const totalCommission = (salesman.salesCommissionEarned || []).reduce(
      (acc, entry) => acc + (entry.amount || 0),
      0
    );

    res.status(200).json({
      message: 'Salesman details fetched successfully',
      salesman: {
        ...salesmanData,
        totalCommissionEarned: totalCommission
      }
    });

  } catch (err) {
    res.status(400).json({
      message: 'Invalid salesman ID or server error',
      error: err.message
    });
  }
};

module.exports = {
  registerSalesman,
  loginSalesman,
  getSalesmanById
};
