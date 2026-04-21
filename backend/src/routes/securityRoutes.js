import express from "express";
import {
  getSecurityLogs,
  getAllSecurityLogs,
  logSecurityEvent,
  getSecurityOverview,
  getSecurityStats,
} from "../controllers/securityController.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Security routes
router.get("/logs", authOrApiKey, getSecurityLogs);
router.get("/logs/all", authOrApiKey, isAdmin, getAllSecurityLogs);
router.post("/logs", authOrApiKey, logSecurityEvent);
router.get("/overview", authOrApiKey, getSecurityOverview);
router.get("/stats", authOrApiKey, isAdmin, getSecurityStats);

router.use((req, res) => {
  res.status(400).json({
    status: false,
    message: "Invalid HTTP request in securityRoutes",
  });
});

export default router;
