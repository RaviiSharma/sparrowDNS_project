
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const isSuperadmin = (req, res, next) => {
  try {
    let decodedUser = req.user;
    if (!decodedUser) {
      // Try reading from JWT (same logic as isAdmin)
      const cookieToken = req.cookies?.["auth-token"];
      const headerToken = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
      const token = cookieToken || headerToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      try {
        decodedUser = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }
      req.user = decodedUser;
    }

    // Only allow superadmin role
    if (decodedUser.role === "superadmin") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Superadmins only.",
    });
  } catch (err) {
    console.error("isSuperadmin error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

