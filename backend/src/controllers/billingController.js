import {
  getCurrentPlan,
  getUsageStats,
  cancelSubscription as cancelSubscriptionService,
  handleWebhook as handleWebhookService,
  getPaymentHistory,
} from '../services/billingService.js';

// Get user's current plan and billing info
export const getPlan = async (req, res) => {
  try {
    const planDetails = await getCurrentPlan(req.user.id);
    if (!planDetails) {
      return res.status(404).send({ status: false, message: "Plan not found" });
    }
    res.status(200).json({ status: true, ...planDetails });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message || "Error in getPlan" });
  }
};

// Get user's current usage stats
export const getUsage = async (req, res) => {
  try {
    const usage = await getUsageStats(req.user.id);
    if (!usage) {
      return res.status(404).send({ status: false, message: "Usage data not found" });
    }
    res.status(200).json({ status: true, ...usage });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message || "Error in getUsage" });
  }
};








export const cancelSubscription = async (req, res) => {
  const result = await cancelSubscriptionService(req.user.id);
  if (!result.status) {
    // If .status is false, always send 404 or 400 as appropriate
    return res.status(404).send(result); // or 400 if logic error
  }
  res.status(200).json(result);
};


// Handle Razorpay payment webhook notifications
export const paymentWebhook = async (req, res) => {
  try {
    const result = await handleWebhookService(req.body, req.headers);
    if (result && result.handled) {
      res.status(200).json({ status: true, received: true, ...result });
    } else {
      return res.status(400).send({ status: false, message: "Webhook handling failed" });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message || "Error in paymentWebhook" });
  }
};

// Get user's history of invoices/payments
export const getHistory = async (req, res) => {
  try {
    const history = await getPaymentHistory(req.user.id);
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(404).send({ status: false, message: "No payment history found" });
    }
    res.status(200).json({ status: true, history });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message || "Error in getHistory" });
  }
};
