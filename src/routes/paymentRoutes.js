const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controller/payment.controller");
const { verifyToken } = require("../middleware/verifyToken");


// Create Razorpay order
router.post("/create-order", verifyToken, createOrder);

// Verify Razorpay payment & activate subscription
router.post("/verify", verifyToken, verifyPayment);

module.exports = router;
