const mongoose = require("mongoose");
const Counter = require('./counter')

const invoiceSchema = new mongoose.Schema(
  {
        invoiceNumber: { type: String, unique: true }, // ✅ Custom invoice number

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
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "invoiceNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.invoiceNumber = `PS${counter.seq.toString().padStart(5, "0")}`;
    // Example: PS00001, PS00002, ...
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
