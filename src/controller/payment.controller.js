const Razorpay = require("razorpay");
const crypto = require("crypto");
const { handleStartSubscription } = require("./subscription.controller"); // import your function

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===================== 📌 CREATE ORDER =====================
const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
};

// ===================== 📌 VERIFY PAYMENT =====================
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shopId, subscriptionPlanId } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature, payment failed" });
    }

    // ✅ Payment verified successfully → activate subscription
    console.log("✅ Payment verified, activating subscription...");

    // inject into req.body for handleStartSubscription
    req.body.subscriptionPlanId = subscriptionPlanId;
    req.body.shopId = shopId;

    // Call subscription activation logic
    await handleStartSubscription(req, res);
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};
module.exports = {
  createOrder,
  verifyPayment
}