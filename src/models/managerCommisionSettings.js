const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  salesCommission: {
    type: Number,
    default: 0,
  },

  salesTarget: { type: Number, default: 0 },
  subscriptionCommission: { type: Number, default: 0 },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ManagerCommissionSettings", commissionSchema);
