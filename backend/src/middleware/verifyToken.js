import jwt from "jsonwebtoken"
const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        resolve({
          success: false,
          message: "Invalid or expired token",
        });
      } else {
        resolve({
          success: true,
          userId: decoded.id, // or whatever field you store user ID in
          email: decoded.email,
          username: decoded.username,
        });
      }
    });
  });
};

