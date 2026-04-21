import { isAuth } from "./authMiddleware.js";
import { apiKeyAuth } from "./apiKeyAuth.js";

export const authOrApiKey = async (req, res, next) => {
  try {
    // 1. Try JWT cookie auth first
    const token = req.cookies["auth-token"];
    if (token) {
      return isAuth(req, res, next);
    }

    // 2. If no JWT, try API key auth
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"];

    if (authHeader || apiKeyHeader) {
      return apiKeyAuth(req, res, next);
    }

    // 3. None provided
    return res.status(401).json({
      success: false,
      message: "Authentication required (JWT or API Key)",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
