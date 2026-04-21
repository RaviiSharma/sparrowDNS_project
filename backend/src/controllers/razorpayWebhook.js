import crypto from 'crypto';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

const PLAN_EXPIRY_DAYS = {
  Pro: 30,
  Business: 90,
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};
      const userId = notes.userId;
      const plan = notes.plan;

      if (!userId || !plan) {
        console.error('Webhook missing userId or plan in notes');
        return res.status(400).json({ success: false, message: 'Invalid webhook notes data' });
      }

      // Check for existing order to avoid duplicates
      const existingOrder = await Order.findOne({ paymentId });
      if (existingOrder) {
        return res.status(200).json({ success: true, message: 'Order already recorded' });
      }

      // Calculate expiry based on plan
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (PLAN_EXPIRY_DAYS[plan] || 0));

      // Create and save order in DB
      const newOrder = new Order({
        userId,
        plan,
        paymentId,
        startDate: new Date(),
        expiryDate,
        isAlertSent: false,
      });
      await newOrder.save();

      // Update user plan
      await User.findByIdAndUpdate(userId, { plan });

      console.log(`Order saved for user ${userId} plan ${plan} payment ${paymentId}`);

      return res.status(200).json({ success: true, message: 'Payment captured and order saved' });
    }

    // For other events just return 200
    res.status(200).json({ success: true, message: 'Event received' });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
