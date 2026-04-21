// src/routes/billingRoutes.js

import express from "express";
import { isSuperadmin } from "../middleware/isSuperAdmin.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";

import {
  getPlan,
  getUsage,
  cancelSubscription,
  paymentWebhook,
  getHistory,
} from "../controllers/billingController.js";

// If you want to add a flat billing status for frontend dashboards:
// import { getBillingStatus } from '../controllers/billingStatusController.js'; // Add this for /api/billing-status

const router = express.Router();

router.get("/plan", authOrApiKey, getPlan);
router.get("/usage", authOrApiKey, getUsage);

router.post("/cancel", authOrApiKey, cancelSubscription);

// Webhook: no auth for external services (Razorpay)
router.post("/webhook", paymentWebhook);

// Payment history
router.get("/history", authOrApiKey, getHistory);

// // Optional: add modern billing status endpoint for SPA/analytics
// router.get('/billing-status', isAdmin, getBillingStatus);

router.use((req, res) => {
  res
    .status(400)
    .send({ status: false, message: "invalid http request in billingRoutes" });
});

export default router;
