import express from "express";
import {
  getAnalyticsOverview,
  getQueryAnalytics,
  getPerformanceMetrics,
  getGeographicAnalytics,
} from "../controllers/analyticsController.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Analytics routes
router.get("/overview", authOrApiKey, isAdmin, getAnalyticsOverview);
router.get("/queries", authOrApiKey, isAdmin, getQueryAnalytics);
router.get("/performance", authOrApiKey, isAdmin, getPerformanceMetrics);
router.get("/geographic", authOrApiKey, isAdmin, getGeographicAnalytics);

router.use((req, res) => {
  res.status(400).json({
    status: false,
    message: "Invalid HTTP request in analyticsRoutes",
  });
});

export default router;
