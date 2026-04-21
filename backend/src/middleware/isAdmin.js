// middleware/isAdmin.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const isAdmin = (req, res, next) => {
  try {
    let decodedUser = null;

    // 1. If user already exists (via API key or auth middleware)
    if (req.user) {
      decodedUser = req.user;
    } else {
      // 2. Try reading JWT from cookie
      const cookieToken = req.cookies?.["auth-token"];

      // 3. Try reading JWT from Authorization header
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

      // Attach decoded user to req
      req.user = decodedUser;
    }

    // 4. Check admin role
    if (decodedUser.role === "admin" || decodedUser.role === "superadmin") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  } catch (err) {
    console.error("isAdmin error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


