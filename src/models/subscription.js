// const mongoose = require("mongoose");
// const moment = require("moment-timezone");

// const subscriptionSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },

//   // 🔗 Link to the full subscription plan (correct key name)
//   subscriptionPlanId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubscriptionPlan", // model name remains correct
//     required: true,
//   },

//   durationDays: {
//     type: Number,
//     required: true,
//   },

//   amount: {
//     type: Number,
//     required: true,
//   },

//   startDate: {
//     type: Date,
//     required: true,
//     default: () => moment().tz("Asia/Kolkata").toDate(),
//   },

//   endDate: {
//     type: Date,
//     required: true,
//   },

//   status: {
//     type: String,
//     enum: ["active", "expired", "pending"],
//     default: "pending",
//   },

//   paymentStatus: {
//     type: String,
//     enum: ["paid", "failed", "pending"],
//     default: "pending",
//   },
// });

// const Subscription = mongoose.model("Subscription", subscriptionSchema);
// module.exports = Subscription;


const mongoose = require("mongoose");
const moment = require("moment-timezone");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true, // ✅ each subscription must belong to a shop
  },

  // 🔗 Link to the full subscription plan
  subscriptionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true,
  },

  durationDays: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },

  endDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "expired", "pending"],
    default: "pending",
  },

  paymentStatus: {
    type: String,
    enum: ["paid", "failed", "pending"],
    default: "pending",
  },
}, { timestamps: true });

// ✅ Ensure only ONE active subscription per shop
subscriptionSchema.index(
  { shopId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;

