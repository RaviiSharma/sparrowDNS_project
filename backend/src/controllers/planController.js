// 
import { validationResult } from 'express-validator';
import { createRazorpayOrder, verifyPayment } from '../services/planService.js';


export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", details: errors.array() });
    }

    const userId = req.user.id; // Auth middleware must set this
    const { plan } = req.body;

    const orderData = await createRazorpayOrder(userId, plan);

    res.status(200).json(orderData);

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const paymentVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', details: errors.array() });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const userId = req.user.id;

    const result = await verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    });

    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
