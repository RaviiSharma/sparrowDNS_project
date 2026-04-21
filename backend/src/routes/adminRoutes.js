// routes/adminRoutes.js
import express from "express";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/admin/adminUsers.js";

import {
  getAllZones,
  getZonesByUser,
  updateZone,
  deleteZone,
} from "../controllers/admin/adminZones.js";

import {
  getAllPayments,
  getPaymentsByUser,
  updateUserPlan,
} from "../controllers/admin/adminPayments.js";

import { getAdminDashboard } from "../controllers/admin/adminDashboard.js";

import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", isAdmin, getAdminDashboard);

// Users
router.get("/users", isAdmin, getAllUsers);
router.get("/users/:userId", isAdmin, getUserById);
router.put("/users/:userId", isAdmin, updateUser);
router.delete("/users/:userId", isAdmin, deleteUser);

// Zones
router.get("/zones", isAdmin, getAllZones);
router.get("/zones/user/:userId", isAdmin, getZonesByUser);
router.put("/zones/:zoneId", isAdmin, updateZone);
router.delete("/zones/:zoneId", isAdmin, deleteZone);

// Payments
router.get("/payments", isAdmin, getAllPayments);
router.get("/payments/:userId", isAdmin, getPaymentsByUser);
router.put("/payments/plan/:userId", isAdmin, updateUserPlan);

export default router;
