import express from "express";

import {
  createZone,
  addRecord,
  listZones,
  listUserZones,
  getRecord,
  updateRecord,
  deleteRecord,
  getZoneByName,
  deleteZone,
  getServerStatus,
  systemHealthController,
  platformStatusController,
  getQueryPerformance7dByUserId,
  getRecentActivity,
  TopDomains,
  transferDomainToUser,
  scanDomainController,
  createZoneAndImportController,
  checkNameserverController,
  getDNSQueries24h,
  getZoneDNSQueries24h,
  deleteMultipleRecords,
} from "../controllers/dnsController.js";

import { checkScope } from "../middleware/checkScope.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js"

const router = express.Router();

/* -------------------------------------------
   ANALYTICS / QUERIES / ACTIVITY
--------------------------------------------*/

// Zone DNS queries in last 24h
router.post("/zone_dnsQueries_24h", authOrApiKey, getZoneDNSQueries24h);

// All DNS queries in last 24h
router.get("/dnsQueries_24h", authOrApiKey, getDNSQueries24h);

// User activity logs (accessible by authenticated users)
router.get("/getRecentActivity", authOrApiKey, getRecentActivity);

// Query performance by user ID (last 7 days)
router.get("/query-performance", authOrApiKey, getQueryPerformance7dByUserId);

/* -------------------------------------------
   DIAGNOSTICS / HEALTH / SCAN
--------------------------------------------*/

// Scan domain
router.post("/scan", authOrApiKey, scanDomainController);

// Check nameservers
router.post("/check-nameserver", authOrApiKey, checkNameserverController);

// System health report
router.get("/health", authOrApiKey, systemHealthController);

// Platform status (overall components health)
router.get("/platform-status", authOrApiKey, platformStatusController);

// Server status
router.get("/server-status", authOrApiKey, getServerStatus);

/* -------------------------------------------
   ZONES
--------------------------------------------*/

// Create zone
router.post("/create-zone", authOrApiKey, checkScope("write"), createZone);

// Delete zone
router.delete("/delete-zone", authOrApiKey, checkScope("write"), deleteZone);

// List all zones (admin or user based on controller)
router.get("/list-zones", authOrApiKey, checkScope("read"), listZones);

// User-specific zone list
router.get("/my-zones", authOrApiKey, checkScope("read"), listUserZones);

// Get zone by name
router.get("/get-zone", authOrApiKey, getZoneByName);

// Import zone (bind file)
router.post(
  "/import-zone",
  authOrApiKey,
  checkScope("write"),
  createZoneAndImportController
);

// Top domains by traffic
router.get("/TopDomains", authOrApiKey, TopDomains);

// Domain owner transfer
router.post("/transfer-domain", authOrApiKey, transferDomainToUser);
  "/transferDomainToUser",
  authOrApiKey,
  checkScope("write"),
  transferDomainToUser
;

/* -------------------------------------------
   RECORDS
--------------------------------------------*/

// Add DNS record
router.post("/add-record", authOrApiKey, checkScope("write"), addRecord);

// Filter records
router.post("/get-recordbyfilter", authOrApiKey, checkScope("read"), getRecord);

// Update DNS record
router.post("/update-record", authOrApiKey, checkScope("write"), updateRecord);

// Delete record
router.post("/delete-record", authOrApiKey, checkScope("write"), deleteRecord);

// Delete multiple records
router.patch(
  "/deleteMultipleRecords",
  authOrApiKey,
  checkScope("write"),
  deleteMultipleRecords
);

/* -------------------------------------------
   FALLBACK ROUTE
--------------------------------------------*/

router.use((req, res) => {
  res.status(400).send({
    status: false,
    message: "Invalid HTTP request in dnsRoutes",
  });
});

export default router;
