import Webhook from "../models/webhookModel.js";
import crypto from "crypto";
import axios from "axios";

// Get all webhooks for current user
export const getWebhooks = async (req, res) => {
  try {
    const userId = req.user._id;

    const webhooks = await Webhook.find({ userId })
      .select("-secret") // Don't send secret in list
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: webhooks.length,
      data: webhooks,
    });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching webhooks",
      error: error.message,
    });
  }
};

// Get webhook by ID
export const getWebhookById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const webhook = await Webhook.findOne({ _id: id, userId });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    res.json({
      status: true,
      data: webhook,
    });
  } catch (error) {
    console.error("Error fetching webhook:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching webhook",
      error: error.message,
    });
  }
};

// Create new webhook
export const createWebhook = async (req, res) => {
  try {
    const { name, url, events } = req.body;
    const userId = req.user._id;

    // Generate secret for webhook signing
    const secret = crypto.randomBytes(32).toString("hex");

    const webhook = new Webhook({
      userId,
      name,
      url,
      events: events || [],
      secret,
    });

    await webhook.save();

    res.status(201).json({
      status: true,
      message: "Webhook created successfully",
      data: {
        ...webhook.toObject(),
        secret, // Show secret only on creation
      },
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    res.status(500).json({
      status: false,
      message: "Error creating webhook",
      error: error.message,
    });
  }
};

// Update webhook
export const updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, url, events, status } = req.body;

    const webhook = await Webhook.findOne({ _id: id, userId });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    if (name) webhook.name = name;
    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (status) webhook.status = status;

    await webhook.save();

    res.json({
      status: true,
      message: "Webhook updated successfully",
      data: webhook,
    });
  } catch (error) {
    console.error("Error updating webhook:", error);
    res.status(500).json({
      status: false,
      message: "Error updating webhook",
      error: error.message,
    });
  }
};

// Delete webhook
export const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const webhook = await Webhook.findOneAndDelete({ _id: id, userId });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    res.json({
      status: true,
      message: "Webhook deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({
      status: false,
      message: "Error deleting webhook",
      error: error.message,
    });
  }
};

// Test webhook
export const testWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const webhook = await Webhook.findOne({ _id: id, userId });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    // Send test payload
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery from SparrowDNS",
      },
    };

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(JSON.stringify(testPayload))
      .digest("hex");

    const startTime = Date.now();
    let success = false;
    let responseCode = 0;

    try {
      const response = await axios.post(webhook.url, testPayload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        timeout: 10000,
      });
      responseCode = response.status;
      success = response.status >= 200 && response.status < 300;
    } catch (error) {
      responseCode = error.response?.status || 0;
      success = false;
    }

    const responseTime = Date.now() - startTime;

    // Log delivery
    webhook.deliveries.push({
      timestamp: new Date(),
      event: "webhook.test",
      status: success ? "success" : "failed",
      responseCode,
      responseTime,
    });

    if (!success) {
      webhook.failureCount += 1;
    } else {
      webhook.failureCount = 0;
      webhook.lastTriggered = new Date();
    }

    // Keep only last 50 deliveries
    if (webhook.deliveries.length > 50) {
      webhook.deliveries = webhook.deliveries.slice(-50);
    }

    await webhook.save();

    res.json({
      status: true,
      message: success ? "Webhook test successful" : "Webhook test failed",
      data: {
        success,
        responseCode,
        responseTime,
      },
    });
  } catch (error) {
    console.error("Error testing webhook:", error);
    res.status(500).json({
      status: false,
      message: "Error testing webhook",
      error: error.message,
    });
  }
};

// Get webhook deliveries
export const getWebhookDeliveries = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { limit = 50 } = req.query;

    const webhook = await Webhook.findOne({ _id: id, userId }).select(
      "deliveries",
    );

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    const deliveries = webhook.deliveries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));

    res.json({
      status: true,
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    console.error("Error fetching webhook deliveries:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching webhook deliveries",
      error: error.message,
    });
  }
};

// Rotate webhook secret
export const rotateWebhookSecret = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const webhook = await Webhook.findOne({ _id: id, userId });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    // Generate new secret
    const newSecret = crypto.randomBytes(32).toString("hex");
    webhook.secret = newSecret;
    await webhook.save();

    res.json({
      status: true,
      message: "Webhook secret rotated successfully",
      data: {
        secret: newSecret,
      },
    });
  } catch (error) {
    console.error("Error rotating webhook secret:", error);
    res.status(500).json({
      status: false,
      message: "Error rotating webhook secret",
      error: error.message,
    });
  }
};

// Helper function to trigger webhook (can be used in other controllers)
export const triggerWebhook = async (userId, event, data) => {
  try {
    const webhooks = await Webhook.find({
      userId,
      status: "active",
      events: event,
    });

    for (const webhook of webhooks) {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const startTime = Date.now();

      try {
        const response = await axios.post(webhook.url, payload, {
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
          },
          timeout: 10000,
        });

        const responseTime = Date.now() - startTime;
        const success = response.status >= 200 && response.status < 300;

        webhook.deliveries.push({
          timestamp: new Date(),
          event,
          status: success ? "success" : "failed",
          responseCode: response.status,
          responseTime,
        });

        if (success) {
          webhook.failureCount = 0;
          webhook.lastTriggered = new Date();
        } else {
          webhook.failureCount += 1;
        }
      } catch (error) {
        webhook.deliveries.push({
          timestamp: new Date(),
          event,
          status: "failed",
          responseCode: error.response?.status || 0,
          responseTime: Date.now() - startTime,
        });
        webhook.failureCount += 1;
      }

      // Disable webhook if too many failures
      if (webhook.failureCount >= 10) {
        webhook.status = "failed";
      }

      // Keep only last 50 deliveries
      if (webhook.deliveries.length > 50) {
        webhook.deliveries = webhook.deliveries.slice(-50);
      }

      await webhook.save();
    }
  } catch (error) {
    console.error("Error triggering webhooks:", error);
  }
};
