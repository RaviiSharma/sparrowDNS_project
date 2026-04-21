import ApiKey from "../models/apiKeyModel.js";

export const apiKeyAuth = async (req, res, next) => {
  try {
    // 1. Extract API key
    const authHeader = req.headers.authorization;
    const headerKey = req.headers["x-api-key"];

    let apiKeyValue = null;

    if (authHeader?.startsWith("Bearer ")) {
      apiKeyValue = authHeader.split(" ")[1];
    } else if (headerKey) {
      apiKeyValue = headerKey;
    }

    if (!apiKeyValue) {
      return res.status(401).json({
        success: false,
        message: "API key missing. Use 'Authorization: Bearer <API_KEY>'",
      });
    }

    // 2. Check API key in DB
    const apiKey = await ApiKey.findOne({ key: apiKeyValue });

    if (!apiKey) {
      return res.status(403).json({
        success: false,
        message: "Invalid API key",
      });
    }

    // 3. Status check
    if (apiKey.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "API key is inactive or revoked",
      });
    }

    // 4. Expiry Check
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: "API key has expired",
      });
    }

    // 5. Attach user (owner) to req
    req.user = {
      id: apiKey.owner,
      via: "apikey"
    };

    req.apiKey = apiKey;

    // 6. Track usage
    apiKey.usageCount = (apiKey.usageCount || 0) + 1;
    apiKey.lastUsed = new Date();
    await apiKey.save();

    next();
  } catch (error) {
    console.error("API Key Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to authenticate API key",
    });
  }
};
