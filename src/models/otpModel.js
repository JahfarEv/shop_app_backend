// models/OTPVerification.js
const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
  },
  verificationId: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("OTPVerification", otpVerificationSchema);
