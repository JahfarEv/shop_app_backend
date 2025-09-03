// // ==============================
// // models/MarketingManager.model.js
// // ==============================

// const mongoose = require('mongoose');

// const marketingManagerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   mobileNumber: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   ifscCode: { type: String, required: true },
//   bankAccountNumber: { type: String, required: true },
//   bankName: { type: String, required: true }, // ✅ added bank name
// pancardNumber: { type: String },

//   isApproved: { type: Boolean, default: false },
//   assignedSalesmen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salesman' }]
// }, { timestamps: true });

// module.exports = mongoose.model('MarketingManager', marketingManagerSchema);



// ==============================
// models/MarketingManager.model.js
// ==============================

const mongoose = require("mongoose");

const marketingManagerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    ifscCode: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    bankName: { type: String },
    pancardNumber: { type: String },

    isApproved: { type: Boolean, default: false },
  agentCode: [{ type: String, unique: true }],

    // ✅ Salesmen assigned under this manager
    assignedSalesmen: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Salesman" }
    ],
shopsAddedByManager: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],

    // ✅ Commissions earned by manager
    commissions: [
      {
        shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
        salesman: { type: mongoose.Schema.Types.ObjectId, ref: "Salesman", default: null }, 
        amount: { type: Number, default: 0 },
        type: {
          type: String,
          enum: ["via_salesman", "direct"], // manager commission type
          default: "via_salesman",
        },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingManager", marketingManagerSchema);
