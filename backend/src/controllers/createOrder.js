import razorpay from '../config/razorpay.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';

const PLAN_PRICES = {
  Pro: 1900,      // in paise (₹19.00)
  Business: 9900, // in paise (₹99.00)
};

const PLAN_EXPIRY_DAYS = {
  Pro: 30,
  Business: 90,
};

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!['Pro', 'Business'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const amount = PLAN_PRICES[plan];
    const receipt = crypto.randomBytes(10).toString('hex');

    // Create Razorpay order with userId and plan in notes for webhook
    const orderOptions = {
      amount,
      currency: 'INR',
      receipt,
      notes: {
        userId,
        plan,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount,
      currency: 'INR',
      plan,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};
