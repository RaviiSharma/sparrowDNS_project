 
import Razorpay from 'razorpay';
import User from '../models/userModel.js';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_CONFIG = {
  Free:     { price: 0.00, domainLimit: 3, queryLimit: 1000000 },
  Pro:      { price: 19.00, domainLimit: 25, queryLimit: 10000000 },
  Business: { price: 99.00, domainLimit: 100, queryLimit: 100000000 }
};


export const createRazorpayOrder = async (userId, plan) => {
  console.log('createRazorpayOrder called with plan:', plan);

  if (!PLAN_CONFIG[plan]) {
    throw new Error("Invalid plan selected");
  }

  const planConfig = PLAN_CONFIG[plan];
  const amountInPaise = planConfig.price * 100;
  const amountInRupee = planConfig.price;


  if (amountInRupee === 0) {
    return { success: true, message: 'Free plan — no payment required', plan };
  };

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  };

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: crypto.randomBytes(8).toString('hex'),
    notes: { plan },
  };

  const order = await razorpay.orders.create(options);

  console.log('order',order);

  user.payments.push({
    orderId: order.id,
    amount: amountInRupee,
    currency: options.currency,
    plan,
    status: 'created',
    createdAt: new Date(),
  });

  await user.save();

  return {
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID,
    order_id: order.id,
    amount: amountInRupee,
    currency: 'INR',
    plan,
  };
};


/**razorpay_payment_id, razorpay_signature these u ll get after user successfull payment only. */
export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }) => {

const userId = req.user.id;//from token
console.log('userId in verifyPayment:', userId);

  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new Error('Payment verification failed due to signature mismatch.');
  }

  if (!PLAN_CONFIG[plan]) {
    throw new Error('Invalid plan.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  user.plan = plan;
  await user.save();

  // Return all Razorpay IDs/signature along with success info
  return {
    success: true,
    message: 'Payment verified and plan upgraded successfully!',
    paymentId: razorpay_payment_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
  };
};
