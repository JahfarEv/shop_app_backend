const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    razorpayInvoiceId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String }, // paid / issued / cancelled
    invoiceUrl: { type: String }, // Razorpay hosted PDF URL
    notes: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
