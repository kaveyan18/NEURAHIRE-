const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order (Called when user clicks "Buy Credits")
const createOrder = async (req, res) => {
  try {
    const { amount, credits } = req.body; // e.g. amount = 500 (₹500), credits = 50

    if (!amount || !credits) {
      return res.status(400).json({ error: "Amount and credits are required" });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise (multiply by 100)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        creditsToRecharge: credits
      }
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ error: "Failed to create Razorpay order" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: "Server error while creating order" });
  }
};

// Verify Payment Signature (Called by Razorpay after payment)
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, creditsToRecharge } = req.body;
    const userId = req.user.userId;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful, update user credits
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.credits += parseInt(creditsToRecharge, 10);
      await user.save();

      res.status(200).json({ success: true, message: "Payment verified successfully", newCredits: user.credits });
    } else {
      res.status(400).json({ success: false, error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: "Server error during payment verification" });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
