

// const mongoose = require("mongoose");

// const subscriptionPlanSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   durationType: {
//     type: String,
//     enum: ["monthly", "yearly"],
//     required: true,
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: [0, "amount must be non‐negative"],
//   },
//   description: {
//     type: String,
//     default: "",
//     trim: true,
//   },
//   // isSubscribed: {
//   //   type: Boolean,
//   //   default: false, // initially false
//   // },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);


const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  durationType: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  baseAmount: {
    type: Number,
    required: true,
    min: [0, "Base amount must be non‐negative"],
  },
  gstAmount: {
    type: Number,
    required: true,
    min: [0, "GST must be non‐negative"],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount must be non‐negative"],
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
