// ==============================
// models/Salesman.model.js
// ==============================

const mongoose = require('mongoose');

const salesmanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankAccountNumber: { type: String, required: true },
  bankName: { type: String, required: true }, // ✅ added bank name
pancardNumber: { type: String },

  // Link to manager (optional)
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketingManager', default: null },

  // Store multiple agent codes issued to this salesman
  agentCode: [{ type: String, unique: true }],
 shopsAddedBySalesman: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }
  ],
  // Shops added using this salesman's agent codes
  // shopsAddedBySalesman: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],
   salesCommissionEarned: [
    {
      shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
      amount: { type: Number, required: true }
    }
  ],
  totalCommission: { type: Number, default: 0 },

  // Admin approval required before login
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

salesmanSchema.pre('save', function (next) {
  if (this.salesCommissionEarned && this.salesCommissionEarned.length > 0) {
    this.totalCommission = this.salesCommissionEarned.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
  } else {
    this.totalCommission = 0;
  }
  next();
});


module.exports = mongoose.model('Salesman', salesmanSchema);
