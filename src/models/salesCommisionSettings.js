const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  salesmanCommission: {
    type: Number,
    default: 0,
  },
  managerCommission: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SalesCommissionSettings", commissionSchema);
