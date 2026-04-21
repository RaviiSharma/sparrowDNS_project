import jwt from "jsonwebtoken"
const JWT_SECRET = process.env.JWT_SECRET;

export const isAuth = (req, res, next) => {
  const token = req.cookies["auth-token"];
  // console.log("Auth Token:", token); // Debugging line

  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user; // Attach user payload to request
    next();
  });
};


