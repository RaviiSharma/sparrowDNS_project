import express from "express";
import {
  getWebhooks,
  getWebhookById,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveries,
  rotateWebhookSecret,
} from "../controllers/integrationsController.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Webhook/Integration routes
router.get("/webhooks", authOrApiKey, getWebhooks);
router.get("/webhooks/:id", authOrApiKey, getWebhookById);
router.post("/webhooks", authOrApiKey, isAdmin, createWebhook);
router.put("/webhooks/:id", authOrApiKey, isAdmin, updateWebhook);
router.delete("/webhooks/:id", authOrApiKey, isAdmin, deleteWebhook);
router.post("/webhooks/:id/test", authOrApiKey, isAdmin, testWebhook);
router.get("/webhooks/:id/deliveries", authOrApiKey, getWebhookDeliveries);
router.post(
  "/webhooks/:id/rotate-secret",
  authOrApiKey,
  isAdmin,
  rotateWebhookSecret,
);

router.use((req, res) => {
  res.status(400).json({
    status: false,
    message: "Invalid HTTP request in integrationsRoutes",
  });
});

export default router;
