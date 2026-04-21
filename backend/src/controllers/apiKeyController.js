import mongoose from "mongoose";

import ApiKey from "../models/apiKeyModel.js";
import crypto from "crypto";
import rateLimiter from "../config/rateLimiter.js";
import User from "../models/userModel.js";

// Create new API key

export const createApiKey = async (req, res) => {
  try {
    const { name, scope, expiresAt } = req.body;

    // Collect validation errors
    const errors = {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.name = "API key name is required and must be a non-empty string";
    }

    // Validate scope if provided (optional, but you can restrict possible values)
    const allowedScopes = ["Read Only", "Full Access", "Write Only"];
    if (scope && !allowedScopes.includes(scope)) {
      errors.scope = `Scope must be one of: ${allowedScopes.join(", ")}`;
    }

    // Validate expiresAt (optional)
    if (expiresAt) {
      const date = new Date(expiresAt);
      if (isNaN(date.getTime())) {
        errors.expiresAt =
          "expiresAt must be a valid date or make sure dates in ISO 8601 format Like This YYYY-MM-DD";
      }
    }

    // If there are any errors, send a 400 response
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Generate API key
    const keyScope = scope || "Read Only";
    const keyPrefix = keyScope === "Full Access" ? "live" : "test";
    const generatedKey = `sk_${keyPrefix}_${crypto
      .randomBytes(16)
      .toString("hex")}`;

    const apiKey = new ApiKey({
      name,
      key: generatedKey,
      scope: keyScope,
      owner: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await apiKey.save();

    return res.status(201).json({
      success: true,
      message: "API key created successfully",
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        scope: apiKey.scope,
        status: apiKey.status,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    // DO NOT leak internal errors to the client. Log internally!
    console.error("Error creating API key:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create API key",
      // Do NOT include error.message unless you're sure it's safe (no internal details).
    });
  }
};

// Get all API keys for a user
export const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      apiKeys: apiKeys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch API keys",
      error: error.message,
    });
  }
};

// Update API key
export const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, scope, status, lastUsed, expiresAt } = req.body;

    const errors = {};

    // Validate id (MongoDB ObjectId as 24 hex chars)
    if (!id || typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      errors.id = "Invalid API key id";
    }

    // Validate name (optional, if provided)
    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      errors.name = "API key name must be a non-empty string";
    }

    // Validate scope (optional, if provided)
    const allowedScopes = ["Read Only", "Full Access", "Write Only"];
    if (scope !== undefined && !allowedScopes.includes(scope)) {
      errors.scope = `Scope must be one of: ${allowedScopes.join(", ")}`;
    }

    // Validate status (optional, if provided)
    const allowedStatus = ["active", "inactive", "revoked"]; // Adjust if needed
    if (status !== undefined && !allowedStatus.includes(status)) {
      errors.status = `Status must be one of: ${allowedStatus.join(", ")}`;
    }
    if (lastUsed) {
      const date = new Date(lastUsed);
      if (isNaN(date.getTime())) {
        errors.lastUsed =
          "lastUsed must be a valid date or make sure dates in ISO 8601 format Like This YYYY-MM-DD";
      }
    }

    // Validate expiresAt (optional)
    if (expiresAt) {
      const date = new Date(expiresAt);
      if (isNaN(date.getTime())) {
        errors.expiresAt =
          "expiresAt must be a valid date or make sure dates in ISO 8601 format Like This YYYY-MM-DD";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const apiKey = await ApiKey.findOne({ _id: id, owner: req.user.id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    if (name) apiKey.name = name;
    if (scope) apiKey.scope = scope;
    if (status) apiKey.status = status;
    if (lastUsed) apiKey.lastUsed = new Date(lastUsed);
    if (expiresAt) apiKey.expiresAt = new Date(expiresAt);

    await apiKey.save();

    res.status(200).json({
      success: true,
      message: "API key updated successfully",
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        scope: apiKey.scope,
        status: apiKey.status,
        lastUsed: apiKey.lastUsed,
        updatedAt: apiKey.updatedAt,
        expiresAt: apiKey.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update API key",
    });
  }
};

// Delete API key

export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log("userId");

    const errors = {};
    if (!id || typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      errors.id = "Invalid API key id";
      return res.status(400).json({ success: false, errors });
    }

    const apiKey = await ApiKey.findOneAndDelete({ _id: id, owner: userId });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete API key",
    });
  }
};


export const getApiUsage = async (req, res) => {
  try {
    console.log("getApiUsage called");

    // Validate user auth
    if (!req.user || !req.user.id || !/^[a-f\d]{24}$/i.test(req.user.id)) {
      return res.status(400).json({
        success: false,
        errors: { userId: "Missing or invalid user id in request" },
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const plan = user.plan || "Free";
    const rateLimit = rateLimiter.rateLimits[plan];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Fetch all API keys of the user
    const userApiKeys = await ApiKey.find({ owner: userId });

    // For each key, calculate today's + month's usage
    const apiKeysUsage = await Promise.all(
      userApiKeys.map(async (key) => {
        // Today usage for this key alone
        const today = await ApiKey.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(key._id),
              lastUsed: { $gte: todayStart },
            },
          },
          { $group: { _id: null, total: { $sum: "$usageCount" } } },
        ]);

        // Month usage for this key
        const month = await ApiKey.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(key._id),
              lastUsed: { $gte: monthStart },
            },
          },
          { $group: { _id: null, total: { $sum: "$usageCount" } } },
        ]);

        return {
          keyId: key._id,
          name: key.name,
          apiKey: key.key,
          scope: key.scope,
          status: key.status,
          todayUsage: today[0]?.total || 0,
          monthUsage: month[0]?.total || 0,
        };
      })
    );

    // Combine totals for all keys
    const totalToday = apiKeysUsage.reduce(
      (sum, k) => sum + k.todayUsage, 0
    );

    const totalMonth = apiKeysUsage.reduce(
      (sum, k) => sum + k.monthUsage, 0
    );

    return res.status(200).json({
      success: true,
      usage: {
        totalToday,
        totalMonth,
        rateLimit,
        keys: apiKeysUsage, // <-- full per-key usage breakdown
      },
    });

  } catch (error) {
    console.error("Error fetching API usage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch API usage",
    });
  }
};


// POST /api/apiKeys/:id/regenerate
export const regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id
    if (!id || typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid API key id" });
    }

    // Find API key by id and owner
    const apiKey = await ApiKey.findOne({ _id: id, owner: req.user.id });

    if (!apiKey) {
      return res
        .status(404)
        .json({ success: false, message: "API key not found" });
    }

    // Generate new key value based on scope
    const keyPrefix = apiKey.scope === "Full Access" ? "live" : "test";
    const newKey = `sk_${keyPrefix}_${crypto.randomBytes(16).toString("hex")}`;

    // Update key and reset lastUsed
    apiKey.key = newKey;
    apiKey.lastUsed = null; // Or new Date() if you wish

    await apiKey.save();

    return res.status(200).json({
      success: true,
      message: "API key regenerated successfully",
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        scope: apiKey.scope,
        status: apiKey.status,
        lastUsed: apiKey.lastUsed,
        updatedAt: apiKey.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to regenerate API key",
    });
  }
};
