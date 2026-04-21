// src/services/billingService.js

import User from '../models/userModel.js';
import Zone from '../models/zoneMetaModel.js';
import ActivityLog from '../models/activityLogModel.js';


import Invoice from '../models/invoiceModel.js';
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// PLAN SETTINGS MASTER — keep these in sync with Razorpay dashboard!
const PLAN_CONFIG = {
  Free:     { planId: null,      price: 0.00, billingCycle: "never", domainLimit: 3,  queryLimit: 1000000 },
  Pro:      { planId: "rzp_plan_Pro_xxxx",      price: 19.00, billingCycle: "per month", domainLimit: 25, queryLimit: 10000000 },
  Business: { planId: "rzp_plan_Business_xxxx", price: 99.00, billingCycle: "per month", domainLimit: 100, queryLimit: 100000000 }
  // Add Enterprise/Custom as needed
};


export const getCurrentPlan = async (userId) => {
  const user = await User.findById(userId).select('payments').lean(); // lean for plain JS object
  if (!user) {
    return { status: false, message: "User not found" };
  }

  const payments = user.payments || [];
  const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;

  if (!lastPayment) {
    return { status: false, message: "No payments found" };
  }

  // Extract plan and amount from last payment object
  const { plan, amount } = lastPayment;
  const config = PLAN_CONFIG[lastPayment.plan];


  return {
    status: true,
    lastPaymentPlan: plan,
    lastPaymentAmount: amount,
    domainUsed:config.domainLimit,
    queryLimit:config.queryLimit,
    billingCycle: config.billingCycle,
    nextBillingDate: user.billing?.renewalDate?.toISOString() || null,
  };
};



// Dynamic usage stats for dashboard
export const getUsageStats = async (userId) => {
  try {
    // Fetch the user and their plan info
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    // Count how many zones are owned by this user
    const zonesCount = await Zone.countDocuments({ owner: userId });

    // Calculate start and end dates of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Count queries by user within the current month using ActivityLog with date filter
    const queriesCount = await ActivityLog.countDocuments({
      userId: userId,
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
    });

    const config = PLAN_CONFIG[user.plan];

    return {
      domainsUsed: { used: zonesCount || 0, limit: config.domainLimit },
      queriesThisMonth: { used: queriesCount || 0, limit: config.queryLimit },
    };
  } catch (error) {
    // Handle or log errors appropriately
    console.error('Error in getUsageStats:', error);
    throw error;
  }
};





// In your src/services/billingService.js

export const cancelSubscription = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.billing?.razorpaySubscriptionId) {
      return { status: false, message: "No active subscription" };
    }
    await razorpay.subscriptions.cancel(user.billing.razorpaySubscriptionId);
    user.plan = 'Free';
    user.billing.razorpaySubscriptionId = undefined;
    user.billing.active = false;
    await user.save();
    return { status: true, message: "Subscription cancelled" };
  } catch (error) {
    return { status: false, message: error.message || "Error cancelling subscription" };
  }
};


// Payment history (from Invoice model)
export const getPaymentHistory = async (userId) => {
  return await Invoice.find({ userId });
};

// Handle Razorpay webhook
export const handleWebhook = async (payload, headers) => {
  // Validate Razorpay signature!
  // Update subscription/plan/payment status in User/Invoice models based on event type.
  // Example:
  // if (payload.event === 'subscription.activated') { ... }
  // Return processed result
  return { handled: true };
};
