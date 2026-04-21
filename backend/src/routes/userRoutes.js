import express from "express";
import {
  getUser,
  updateProfile,
  getBillingStatus,
} from "../controllers/userController.js";
import { isAuth } from "../middleware/authMiddleware.js"; // or authOrApiKey if needed

import { isAdmin } from "../middleware/isAdmin.js";

// If you intended authOrApiKey:
// import authOrApiKey from '../middleware/authOrApiKey.js';

const router = express.Router();

// Current user info
router.get("/me", isAuth, getUser);

// Update profile (fixing undefined updateProfile)
router.put("/update-profile", isAuth, updateProfile);

// Billing status
router.get("/billing-status", isAuth, getBillingStatus);

router.use((req, res) => {
  res
    .status(400)
    .json({ status: false, message: "invalid http request in userRoutes" });
});

export default router;
