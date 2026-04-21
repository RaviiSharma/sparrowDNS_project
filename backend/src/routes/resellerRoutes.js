import express from "express";
import {
  getAllResellers,
  getResellerById,
  createReseller,
  updateReseller,
  deleteReseller,
  getResellerStats,
  updateResellerUsage,
} from "../controllers/resellerController.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { isSuperadmin } from "../middleware/isSuperAdmin.js";

const router = express.Router();

// Reseller routes (most require admin/superadmin access)
router.get("/", authOrApiKey, isAdmin, getAllResellers);
router.get("/stats", authOrApiKey, isAdmin, getResellerStats);
router.get("/:id", authOrApiKey, isAdmin, getResellerById);
router.post("/", authOrApiKey, isSuperadmin, createReseller);
router.put("/:id", authOrApiKey, isAdmin, updateReseller);
router.put("/:id/usage", authOrApiKey, isAdmin, updateResellerUsage);
router.delete("/:id", authOrApiKey, isSuperadmin, deleteReseller);

router.use((req, res) => {
  res.status(400).json({
    status: false,
    message: "Invalid HTTP request in resellerRoutes",
  });
});

export default router;
