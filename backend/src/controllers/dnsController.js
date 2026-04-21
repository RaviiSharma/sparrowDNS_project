import {
  createZoneService,
  getZoneByNameService,
  addRecordService,
  listZonesService,
  getRecordService,
  updateRecordService,
  deleteRecordService,
  deleteZoneService,
  deleteMultipleRecordsService,
} from "../services/powerdnsService.js";

import { validateZoneType } from "../utils/validateZoneType.js";
import { validateZoneFields } from "../utils/validateZoneFields.js";

import ActivityLog from "../models/activityLogModel.js";
import ZoneStats from "../models/zoneStatsModel.js";
import StatsModel from "../models/statsModel.js";

import ZoneMeta from "../models/zoneMetaModel.js";
import User from "../models/userModel.js";

import whois from "whois";

import axios from "axios";

const zoneNameRegex =
  /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63}(?<!-))*\.$/;

// PowerDNS credentials from .env
const PDNS_URL = process.env.PDNS_URL; // e.g. "http://138.199.159.199:8081/api/v1"
const PDNS_API_KEY = process.env.PDNS_API_KEY; // your API key

if (!PDNS_URL) {
  console.error(" Missing PDNS_URL in .env file");
}

// Axios client for PowerDNS API
const client = axios.create({
  baseURL: PDNS_URL,
  headers: {
    "X-API-Key": PDNS_API_KEY,
    "Content-Type": "application/json",
  },
});

import mongoose from "mongoose";
// import dns from "dns/promises";

// ✅ Controller: System Health Check
export const systemHealthController = async (req, res) => {
  const healthReport = {
    backend: false,
    mongoDB: false,
    powerDNS: false,
    details: {},
  };

  try {
    // 🧩 Backend
    healthReport.backend = true;
    healthReport.details.backend = "Backend server is running.";

    // 🗄️ MongoDB Connection Check
    if (mongoose.connection.readyState === 1) {
      healthReport.mongoDB = true;
      healthReport.details.mongoDB = "MongoDB connected.";
    } else {
      healthReport.details.mongoDB = "MongoDB not connected.";
    }

    // 🌐 PowerDNS Connection Check
    try {
      const response = await client.get("/servers/localhost");
      if (response?.status === 200) {
        healthReport.powerDNS = true;
        healthReport.details.powerDNS = "PowerDNS reachable.";
      }
    } catch (err) {
      healthReport.details.powerDNS = `PowerDNS unreachable: ${err.message}`;
    }

    // 🟢 Final health status
    const allHealthy =
      healthReport.backend && healthReport.mongoDB && healthReport.powerDNS;

    return res.status(allHealthy ? 200 : 500).json({
      status: allHealthy,
      message: allHealthy
        ? "✅ All systems operational."
        : "⚠️ Some systems are down.",
      data: healthReport,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(" System health check failed:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error while checking system health.",
      error: err.message,
    });
  }
};

// ✅ Controller: Platform System Status (Real-time)
// Provides high-level operational status for core components.
// Components: DNS Resolution, API Services, Management Portal, Health Checks
export const platformStatusController = async (req, res) => {
  const timestamp = new Date().toISOString();

  // Helper to build component objects
  const build = (key, name, status, description, incident = null) => {
    const color =
      status === "Operational"
        ? "grey"
        : status === "Degraded"
        ? "yellow"
        : "red";
    return { key, name, status, color, description, incident };
  };

  // DNS Resolution check via PowerDNS API
  let dnsComponent;
  try {
    const resp = await client.get("/servers/localhost");
    if (resp.status === 200) {
      dnsComponent = build(
        "dns",
        "DNS Resolution",
        "Operational",
        "PowerDNS responding normally"
      );
    } else {
      dnsComponent = build(
        "dns",
        "DNS Resolution",
        "Degraded",
        "Unexpected status from PowerDNS",
        { code: resp.status, message: "Non-200 response" }
      );
    }
  } catch (err) {
    dnsComponent = build(
      "dns",
      "DNS Resolution",
      "Degraded",
      "Failed to reach PowerDNS",
      { message: err.message }
    );
  }

  // API Services (current backend process health)
  let apiComponent;
  try {
    const uptimeSec = Math.round(process.uptime());
    apiComponent = build(
      "api",
      "API Services",
      "Operational",
      `Backend responsive (uptime ${uptimeSec}s)`
    );
  } catch (err) {
    apiComponent = build(
      "api",
      "API Services",
      "Degraded",
      "Process health check failed",
      { message: err.message }
    );
  }

  // Management Portal (frontend availability if URL provided)
  let portalComponent;
  const portalUrl = process.env.FRONTEND_URL;
  if (portalUrl) {
    try {
      // Use HEAD for lightweight availability test
      await axios.head(portalUrl, { timeout: 3000 }).catch(async (headErr) => {
        // Some hosts may not allow HEAD; fallback to GET
        try {
          await axios.get(portalUrl, { timeout: 3000 });
        } catch (getErr) {
          throw getErr;
        }
      });
      portalComponent = build(
        "portal",
        "Management Portal",
        "Operational",
        "Frontend reachable"
      );
    } catch (err) {
      portalComponent = build(
        "portal",
        "Management Portal",
        "Degraded",
        "Frontend not reachable",
        { message: err.message }
      );
    }
  } else {
    portalComponent = build(
      "portal",
      "Management Portal",
      "Operational",
      "No FRONTEND_URL configured; assuming operational"
    );
  }

  // Health Checks (recent metrics ingestion)
  let healthChecksComponent;
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentStat = await StatsModel.findOne({
      hour: { $gte: oneHourAgo },
    }).sort({ hour: -1 });
    if (recentStat) {
      healthChecksComponent = build(
        "health_checks",
        "Health Checks",
        "Operational",
        "Recent metrics ingested",
        null
      );
    } else {
      healthChecksComponent = build(
        "health_checks",
        "Health Checks",
        "Degraded",
        "No metrics recorded in last hour",
        { message: "StatsModel has no recent documents" }
      );
    }
  } catch (err) {
    healthChecksComponent = build(
      "health_checks",
      "Health Checks",
      "Degraded",
      "Metrics query failed",
      { message: err.message }
    );
  }

  const components = [
    dnsComponent,
    apiComponent,
    portalComponent,
    healthChecksComponent,
  ];

  // Overall status: degraded if any component degraded, operational only if all operational
  const overallStatus = components.every((c) => c.status === "Operational")
    ? "Operational"
    : components.some((c) => c.status === "Degraded")
    ? "Degraded"
    : "Unknown";

  return res.json({
    system_status: {
      timestamp,
      overall_status: overallStatus,
      components,
    },
  });
};

//--------------------------------- zones --------------------------------------
export const listZones = async (req, res) => {
  try {
    // Or all zones:

    const zones = await listZonesService();

    if (!zones || zones.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No DNS zones found.",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "Zones with full DNS records fetched successfully.",
      count: Array.isArray(zones) ? zones.length : 0,
      data: zones,
    });
  } catch (err) {
    console.error("Error in listZones controller:", err);

    if (err instanceof Error) {
      return res.status(400).json({ status: false, message: err.message });
    }

    return res.status(500).json({
      status: false,
      message: "Internal Server Error while fetching zones.",
    });
  }
};

export const listUserZones = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Authentication required: Cannot fetch user zones.",
        data: [],
      });
    }

    // Fetch all zones owned by this user
    const zones = await ZoneMeta.find({ owner: userId });

    if (!zones || zones.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No DNS zones found for this user.",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "Your DNS zones fetched successfully.",
      count: zones.length,
      data: zones,
    });
  } catch (err) {
    console.error("Error in listUserZones controller:", err);

    if (err instanceof Error) {
      return res.status(400).json({ status: false, message: err.message });
    }

    return res.status(500).json({
      status: false,
      message: "Internal Server Error while fetching user-specific zones.",
      data: [],
    });
  }
};

export const createZone = async (req, res, next) => {
  try {
    const {
      name,
      kind,
      masters = [],
      nameservers = [],
      description,
      tags,
    } = req.body;
    const owner = req.user.id; // Always from auth middleware (not body!)

    // Validate zone name
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Zone name (string) is required." });
    }
    if (!zoneNameRegex.test(name)) {
      return res.status(400).json({
        status: false,
        message: `Invalid zone name '${name}'. Must be a valid domain ending with a dot.`,
      });
    }

    // Check Zone Type
    const { valid: validKind, message: kindMsg } = validateZoneType(kind);
    if (!validKind) {
      return res.status(400).json({ status: false, message: kindMsg });
    }

    // Check Masters & Nameservers
    const { valid, message } = validateZoneFields(kind, masters, nameservers);
    if (!valid) {
      return res.status(400).json({ status: false, message });
    }

    // Normalize zone name to end with a dot
    const formattedName = name.endsWith(".") ? name : name + ".";

    // Create Zone via PowerDNS API
    const data = await createZoneService({
      name: formattedName,
      kind,
      masters,
      nameservers,
    });

    if (data?.exists) {
      return res.status(409).json({
        status: false,
        message: `Zone '${formattedName}' already exists in pdns.`,
      });
    }

    const existingZone = await ZoneMeta.findOne({ zoneName: name });
    if (existingZone) {
      return res.status(409).json({
        status: false,
        message: `Zone '${name}' already exists in MongoDB metadata.`,
      });
    }

    // Store metadata in MongoDB, always use userId as owner
    const meta = await ZoneMeta.create({
      zoneName: formattedName,
      owner: owner,
      description: description || "",
      tags: tags || [],
      syncedWithPDNS: true,
    });

    // Log activity in MongoDB, userId = owner (token)
    await ActivityLog.create({
      userId: owner,
      action: "CREATE_ZONE",
      target: formattedName,
      details: {
        kind,
        masters,
        nameservers,
        description,
        tags,
        zoneMetaId: meta._id,
      },
      ip: req.ip || "unknown",
    });

    // Success response
    return res.status(201).json({
      status: true,
      message: `Zone '${formattedName}' created successfully.`,
      data,
    });
  } catch (err) {
    console.error("Error in createZone controller:", err);

    // Friendly duplicate key error handling
    if (err.code === 11000 && err.keyPattern?.zoneName) {
      return res.status(409).json({
        status: false,
        message: `Zone '${err.keyValue.zoneName}' already exists in MongoDB.`,
      });
    }

    if (err instanceof Error) {
      return res.status(400).json({ status: false, message: err.message });
    }

    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error." });
  }
};

export const getZoneByName = async (req, res) => {
  try {
    const { zoneName } = req.body;
    const userId = req.user?.id; // From isAuth middleware

    if (!zoneName || typeof zoneName !== "string") {
      return res
        .status(400)
        .send({ status: false, message: "Zone name (string) is required." });
    }
    const formattedName = zoneName.endsWith(".") ? zoneName : zoneName + ".";

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({
      zoneName: formattedName,
      owner: userId,
    });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }
    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
    const start = Date.now();

    let zoneData;
    try {
      zoneData = await getZoneByNameService(formattedName);
    } catch (serviceErr) {
      console.error("Service error in getZoneByNameService:", serviceErr);
      return res.status(502).send({
        status: false,
        message: "Zone fetch service failed.",
        error: serviceErr.message,
      });
    }
    const lastMeasuredLatency = Date.now() - start;

    if (zoneData?.notFound) {
      await ZoneStats.updateOne(
        { zone: formattedName, owner: userId, hour: roundedHour },
        { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
        { upsert: true }
      );
      // Log zone lookup with user id
      await ActivityLog.create({
        userId,
        action: "LOOKUP_ZONE",
        target: formattedName,
        details: { notFound: true },
        ip: req.ip || "unknown",
      });
      return res
        .status(404)
        .send({ status: false, message: `Zone '${formattedName}' not found.` });
    }

    if (!zoneData) {
      await ZoneStats.updateOne(
        { zone: formattedName, owner: userId, hour: roundedHour },
        { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
        { upsert: true }
      );
      await ActivityLog.create({
        userId,
        action: "LOOKUP_ZONE",
        target: formattedName,
        details: { noData: true },
        ip: req.ip || "unknown",
      });
      return res.status(404).send({
        status: false,
        message: `No data found for zone '${formattedName}'.`,
      });
    }

    // Save query stats (success case)
    await ZoneStats.updateOne(
      { zone: formattedName, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Log zone fetch with user id
    await ActivityLog.create({
      userId,
      action: "LOOKUP_ZONE",
      target: formattedName,
      details: { success: true },
      ip: req.ip || "unknown",
    });

    return res.status(200).send({
      status: true,
      message: `Zone '${formattedName}' fetched successfully.`,
      data: zoneData,
    });
  } catch (err) {
    console.error("Error in getZoneByName controller:", err);
    return res.status(500).send({
      status: false,
      message: "Internal Server Error.",
      error: err.message,
    });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { zoneName } = req.body;
    if (!zoneName || typeof zoneName !== "string") {
      return res
        .status(400)
        .send({ status: false, message: "Zone name (string) is required." });
    }

    const formattedName = zoneName.endsWith(".") ? zoneName : zoneName + ".";
    const userId = req.user?.id; // from JWT context

    console.log("formattedName:", formattedName, "userId:", userId);

    // 1️⃣ Authorization: find ZoneMeta by unique zoneName and owner userId
    const meta = await ZoneMeta.findOne({
      zoneName: formattedName,
      owner: userId,
    });
    console.log("meta", meta);

    if (!meta) {
      return res.status(403).send({
        status: false,
        message:
          "You are not authorized to delete this zone or zone does not exist.",
      });
    }

    // 2️⃣ Delete from PowerDNS by zone name
    const data = await deleteZoneService(formattedName);
    if (data?.notFound) {
      return res.status(404).send({
        status: false,
        message: `Zone '${formattedName}' not found in PowerDNS.`,
      });
    }

    // 3️⃣ Delete metadata from MongoDB by unique zoneName + owner
    const deletedMeta = await ZoneMeta.findOneAndDelete({
      zoneName: formattedName,
      owner: userId,
    });

    await ZoneStats.updateOne(
      { zone: formattedName, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // 4️⃣ Log deletion activity
    await ActivityLog.create({
      userId: userId || "unknown",
      action: "DELETE_ZONE",
      target: formattedName,
      details: {
        from: "PowerDNS + MongoDB",
        metaDeleted: !!deletedMeta,
      },
      ip: req.ip || "unknown",
    });

    return res.status(200).json({
      status: true,
      message: `Zone '${formattedName}' deleted successfully from PowerDNS and MongoDB.`,
      data: {
        pdns: data,
        metaDeleted: !!deletedMeta,
      },
    });
  } catch (err) {
    console.error("Error in deleteZone controller:", err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error." });
  }
};

export const transferDomainToUser = async (req, res) => {
  try {
    const { domainId, domainName, targetUserId } = req.body;
    const currentUserId = req.user?.id;

    if (!targetUserId || typeof targetUserId !== "string") {
      return res.status(400).send({
        status: false,
        message: "TargetUserId (string) is required.",
      });
    }

    // Validate inputs - one of domainId or domainName must be provided
    if (
      (!domainId && !domainName) ||
      (domainId && typeof domainId !== "string") ||
      (domainName && typeof domainName !== "string")
    ) {
      return res.status(400).send({
        status: false,
        message: "Either domainId or domainName (string) must be provided.",
      });
    }

    let domain;

    if (domainName) {
      // Validate domainName trailing dot
      if (!domainName.endsWith(".")) {
        return res.status(400).send({
          status: false,
          message:
            "Domain name must end with a trailing dot (e.g. 'example.com.').",
        });
      }
      // Find domain by domainName (assuming it's unique)
      domain = await ZoneMeta.findOne({ zoneName: domainName });
    } else if (domainId) {
      // Find domain by domainId
      domain = await ZoneMeta.findById(domainId);
    }

    if (!domain) {
      return res.status(404).send({
        status: false,
        message: "Domain not found using the provided identifier.",
      });
    }

    console.log(
      `Domain Owner: ${domain.owner}, Current User: ${currentUserId}`
    );

    // Check target user existence
    const userModel = await User.findById(targetUserId);
    if (!userModel) {
      return res.status(404).send({
        status: false,
        message: `User with id '${targetUserId}' not found.`,
      });
    }

    // Ownership check: current user must own the domain
    if (domain.owner.toString() !== currentUserId) {
      return res.status(403).send({
        status: false,
        message: "You are not authorized to transfer this domain.",
      });
    }

    // Start latency timer
    const start = Date.now();

    // Transfer ownership
    domain.owner = targetUserId;
    await domain.save();

    // Measure of operation latency
    const lastMeasuredLatency = Date.now() - start;

    // Update zone stats for current owner after transfer
    const roundedHour = new Date();
    roundedHour.setMinutes(0, 0, 0);

    await ZoneStats.updateOne(
      {
        zone: domain.zoneName,
        owner: new mongoose.Types.ObjectId(currentUserId),
        hour: roundedHour,
      },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Log the transfer
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(currentUserId),
      action: "TRANSFER_DOMAIN",
      target: domain._id,
      details: { newOwner: targetUserId },
      ip: req.ip || "unknown",
    });

    return res.status(200).send({
      status: true,
      message: `Domain ownership transferred successfully.`,
      data: domain,
    });
  } catch (err) {
    console.error("Error in transferDomainToUser controller:", err);
    return res.status(500).send({
      status: false,
      message: "Internal Server Error.",
      error: err.message,
    });
  }
};

const allowedTypes = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "SOA",
  "TXT",
  "PTR",
  "SRV",
  "CAA",
  "SSHFP",
  "DNSKEY",
  "RRSIG",
  "NSEC",
  "NSEC3",
  "NSEC3PARAM",
  "DS",
  "TLSA",
  "SPF",
  "HINFO",
  "NAPTR",
  "LOC",
];

/** ================================
 *  ADD RECORD CONTROLLER
 *  ================================ */

export const addRecord = async (req, res) => {
  try {
    const { zone, recordName, type, content, ttl } = req.body;
    console.log(content);
    const userId = req.user?.id; // From isAuth middleware

    if (!zone.endsWith(".")) {
      return res.status(400).send({
        status: false,
        message:
          "zone name must end with a trailing dot (e.g. 'example.com.').",
      });
    }

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({
      zoneName: zone,
      owner: userId,
    });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }
    // ...all your validation as before...

    // Service call & latency
    let data;
    const start = Date.now();
    try {
      data = await addRecordService(req.body);
    } catch (apiErr) {
      if (apiErr.response?.status === 422) {
        return res.status(400).send({
          status: false,
          message: `PowerDNS error: ${
            apiErr.response.data?.error || "Unprocessable Entity"
          }`,
        });
      }
      throw apiErr;
    }

    if (data?.notFound) {
      return res.status(404).send({
        status: false,
        message: `Zone '${zone}' not found in PowerDNS.`,
      });
    }

    // Update zone query stats (can also log userId if desired)
    const lastMeasuredLatency = Date.now() - start;
    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
    await ZoneStats.updateOne(
      { zone, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Log activity with user ID
    await ActivityLog.create({
      userId: userId,
      action: "ADD_RECORD",
      target: recordName,
      details: { zone, type, content, ttl },
      ip: req.ip || "unknown",
    });

    return res.status(201).send({
      status: true,
      message: "Record added successfully.",
      data,
    });
  } catch (err) {
    console.error("Error in addRecord:", err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error." });
  }
};

export const getRecord = async (req, res) => {
  try {
    const { zone, recordName, type } = req.body;
    const zoneName = zone.endsWith(".") ? zone : zone + ".";
    const userId = req.user?.id; // From isAuth middleware
    console.log("Getting record:", zoneName, recordName, type, userId);

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({
      zoneName: zoneName,
      owner: userId,
    });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }
    console.log("zoneExists", zoneExists);

    // ...validation as before...

    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
    const start = Date.now();
    const data = await getRecordService({ zone: zoneName, recordName, type });
    const lastMeasuredLatency = Date.now() - start;

    if (data?.notFound) {
      return res.status(404).send({
        status: false,
        message: `Zone '${zone}' not found in PowerDNS.`,
      });
    }
    if (!data || data.length === 0) {
      return res.status(404).send({
        status: false,
        message: "No record found for the given zone/criteria.",
      });
    }

    await ZoneStats.updateOne(
      { zone: zoneName, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Optional: Log query with userId
    await ActivityLog.create({
      userId,
      action: "GET_RECORD",
      target: zoneName,
      details: { recordName, type },
      ip: req.ip || "unknown",
    });

    return res.status(200).send({
      status: true,
      message: "Record(s) found.",
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Error in getRecord:", err.message);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error." });
  }
};

export const updateRecord = async (req, res) => {
  try {
    console.log("updateRecord called with body:", req.body);
    const { zone, recordName, type, records, ttl, newRecordName } = req.body;
    const userId = req.user?.id;

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({ zoneName: zone, owner: userId });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }

    // ...validations as before...
    console.log(records, type);
    const normalizedRecords = records.map((record) => {
      let contentStr = record.content;
      if (type === "MX" && typeof record.priority === "number") {
        contentStr = `${record.priority} ${record.content.replace(
          /^\d+\s*/,
          ""
        )}`;
      }
      return {
        content: contentStr,
        ttl: ttl || 3600,
        disabled: record.disabled === true,
      };
    });

    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
    const start = Date.now();

    let data;
    try {
      data = await updateRecordService({
        zone,
        recordName,
        type: type,
        records: normalizedRecords,
        ttl,
        newRecordName,
      });
    } catch (apiErr) {
      if (apiErr.response?.status === 422) {
        return res.status(400).send({
          status: false,
          message: `PowerDNS error: ${
            apiErr.response.data?.error || "Unprocessable Entity"
          }`,
        });
      }
      throw apiErr;
    }

    if (data?.notFound) {
      return res.status(404).send({
        status: false,
        message: `Zone '${zone}' not found in PowerDNS.`,
      });
    }

    const lastMeasuredLatency = Date.now() - start;

    await ZoneStats.updateOne(
      { zone, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Add log entry with userId
    await ActivityLog.create({
      userId,
      action: "UPDATE_RECORD",
      target: recordName,
      details: { zone, type: type, records, ttl, newRecordName },
      ip: req.ip || "unknown",
    });

    return res.status(200).send({
      status: true,
      message: newRecordName
        ? "Record renamed and updated successfully."
        : "Record updated successfully.",
      data,
    });
  } catch (err) {
    console.error("Error in updateRecord:", err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error." });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { zone, recordName, type } = req.body;
    const userId = req.user?.id;

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({ zoneName: zone, owner: userId });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }

    // ...validations as before...

    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );

    const start = Date.now();
    const data = await deleteRecordService({ zone, recordName, type });
    const lastMeasuredLatency = Date.now() - start;

    if (data?.notFound) {
      return res.status(404).send({
        status: false,
        message: `Zone '${zone}' not found in PowerDNS.`,
      });
    }
    if (data?.recordNotFound) {
      return res.status(404).send({
        status: false,
        message: `Record '${recordName}' of type '${type}' not found in zone '${zone}'.`,
      });
    }

    await ZoneStats.updateOne(
      { zone, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Log action with userId
    await ActivityLog.create({
      userId,
      action: "DELETE_RECORD",
      target: recordName,
      details: { zone, type },
      ip: req.ip || "unknown",
    });

    return res.status(200).send({
      status: true,
      message: "Record deleted successfully.",
      data,
    });
  } catch (err) {
    console.error("Error in deleteRecord:", err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error." });
  }
};

export const deleteRecords = async (req, res) => {
  try {
    console.log("deleteRecords called with body:", req.body);
    const { zone } = req.body; // only zone is needed now

    if (!zone) {
      return res.status(400).send({
        status: false,
        message: "zone is required",
      });
    }

    const userId = req.user?.id;

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({ zoneName: zone, owner: userId });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }

    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );

    const start = Date.now();
    // Call updated service without records param
    const data = await deleteMultipleRecordsService({ zone });
    const lastMeasuredLatency = Date.now() - start;

    if (data?.notFound) {
      return res.status(404).send({
        status: false,
        message: `Zone '${zone}' not found in PowerDNS.`,
      });
    }
    if (data?.noRecordsToDelete) {
      return res.status(200).send({
        status: true,
        message: `No records to delete in zone '${zone}' except SOA and NS.`,
      });
    }

    await ZoneStats.updateOne(
      { zone, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );

    // Log a single delete action for the zone-wide deletion
    await ActivityLog.create({
      userId,
      action: "DELETE_ALL_RECORDS_EXCEPT_SOA_NS",
      target: zone,
      details: { zone },
      ip: req.ip || "unknown",
    });

    return res.status(200).send({
      status: true,
      message: "All records except SOA and NS deleted successfully.",
      data,
    });
  } catch (err) {
    console.error("Error in deleteRecords:", err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error." });
  }
};

// ✅ Controller: Get PowerDNS Server Status
export const getServerStatus = async (req, res) => {
  try {
    // Fetch server status
    const response = await client.get("/servers/localhost");

    const data = response.data;

    // Optional: derive more readable info
    const serverInfo = {
      id: data.id,
      daemonType: data.daemon_type,
      version: data.version,
      url: data.url,
      configDir: data.config_dir,
      recursor: data.recursor,
      zonesUrl: data.zones_url,
      statisticsUrl: data.statistics_url,
    };

    // Respond with clean JSON
    return res.status(200).json({
      status: true,
      message: "PowerDNS server status fetched successfully.",
      data: serverInfo,
    });
  } catch (err) {
    console.error(" Error in getServerStatusController:", err.message);

    // Handle common error codes
    if (err.response?.status === 401) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid or missing API key.",
      });
    }

    if (err.response?.status === 404) {
      return res.status(404).json({
        status: false,
        message: "Server not found — check PowerDNS configuration.",
      });
    }

    // Fallback for unexpected errors
    return res.status(500).json({
      status: false,
      message: "Failed to fetch PowerDNS server status.",
      error: err.message,
    });
  }
};

//scan domain

import { scanDNSRecords } from "../services/dnsScanService.js";

export const scanDomainController = async (req, res) => {
  try {
    const { domain } = req.body;
    const userId = req.user?.id; // From isAuth middleware

    // 🛑 Validation
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: " Domain field is required.",
      });
    }

    // Check for zone existence FIRST
    const zoneExists = await ZoneMeta.exists({
      zoneName: domain,
      owner: userId,
    });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }
    // 🧾 Yahan apne nameservers define karo
    const ourNameservers = [
      "ns1.in.select",
      "ns2.in.select",
      // 'ns1.sparrowhost.com',
      // 'ns2.sparrowhost.com'
    ];
    // Start measuring latency
    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
    const start = Date.now();
    // 🔍 Perform DNS scan
    const { records, hasAnyRecord, isValidNS } = await scanDNSRecords(
      domain,
      ourNameservers
    );

    const lastMeasuredLatency = Date.now() - start;

    if (!hasAnyRecord) {
      return res.status(404).json({
        success: false,
        domain,
        message: `⚠️ No DNS records found for domain: ${domain}`,
        records,
        isValidNS,
      });
    }

    // Save zone query statistics
    await ZoneStats.updateOne(
      { zone: domain, owner: userId, hour: roundedHour },
      { $inc: { queries: 1 }, $set: { latency: lastMeasuredLatency } },
      { upsert: true }
    );
    return res.status(200).json({
      success: true,
      domain,
      message: "✅ DNS records scanned successfully.",
      isValidNS,
      records,
    });
  } catch (error) {
    console.error("DNS Scan Error:", error.message);

    res.status(500).json({
      success: false,
      message: `Failed to scan DNS records for ${
        req.body?.domain || "unknown domain"
      }`,
      error: error.message,
    });
  }
};

/** ________________ createZoneAndImportController ______________________________          */

import {
  createZoneInPowerDNS,
  createMinimalZoneRRsets,
} from "../services/powerdnsService.js";

export const createZoneAndImportController = async (req, res) => {
  try {
    const { domain, importRecords, ourNameservers } = req.body;

    if (!domain || typeof domain !== "string") {
      return res.status(400).json({
        success: false,
        message: "Domain is required and must be a string.",
      });
    }

    const canonicalDomain = domain.endsWith(".") ? domain : domain + ".";
    let rrsets;

    // 🧩 Step 1: Check if domain already exists in DB
    let zone = await ZoneMeta.findOne({ zoneName: canonicalDomain });

    if (zone) {
      // ✅ Domain already exists
      if (importRecords === true) {
        return res.status(200).json({
          success: true,
          message: "Domain already exists — returning imported records.",
          data: zone,
        });
      } else {
        // Return zone details but remove records field if present
        const zoneWithoutRecords = zone.toObject();
        delete zoneWithoutRecords.records;
        return res.status(200).json({
          success: true,
          message: "Domain already exists — returning domain info only.",
          data: zoneWithoutRecords,
        });
      }
    }

    // 🧩 Step 2: Domain doesn't exist — create zone now
    if (importRecords) {
      const { records } = await scanDNSRecords(
        canonicalDomain,
        ourNameservers || []
      );
      rrsets = Object.entries(records).flatMap(([type, recArr]) => {
        if (!recArr.length) return [];
        return [
          {
            name: canonicalDomain,
            type,
            ttl: 3600,
            records: recArr.map((content) => ({ content, disabled: false })),
          },
        ];
      });
    } else {
      const { records } = await scanDNSRecords(
        canonicalDomain,
        ourNameservers || []
      );
      const nsRecords = records.NS?.length
        ? records.NS
        : ["ns1.select.in.", "ns2.select.in."];
      rrsets = createMinimalZoneRRsets(canonicalDomain, nsRecords);
    }

    // 🧩 Step 3: Create zone in PowerDNS
    const pdnsZone = await createZoneInPowerDNS(canonicalDomain, rrsets);
    console.log(
      "✅ Created zone in PowerDNS:",
      pdnsZone?.name || canonicalDomain
    );

    // 🧩 Step 4: Save zone in DB
    zone = new ZoneMeta({
      zoneName: canonicalDomain,
      owner: req.user?.id,
      description: importRecords ? "Imported zone" : "Newly created zone",
      tags: [importRecords ? "imported" : "new"],
      syncedWithPDNS: true,
      createdAt: new Date(),
      records: rrsets,
    });

    await zone.save();

    // 🧩 Step 5: Return full zone + rrsets
    return res.status(201).json({
      success: true,
      message: "Zone created successfully with SOA + NS records.",
      data: zone,
    });
  } catch (error) {
    console.error("❌ Error in createZoneAndImportController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

/**_______________checkNameserverController_____________________________ */

export const checkNameserverController = async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({
      success: false,
      message: "Domain is required",
    });
  }

  try {
    const normalizedDomain = domain.toLowerCase().replace(/\.$/, "");

    // WHOIS options with follow for referrals
    const options = { timeout: 20000, follow: 3 };

    // Promisify whois.lookup
    const whoisData = await new Promise((resolve) => {
      whois.lookup(normalizedDomain, options, (err, data) => {
        if (err) {
          console.warn("WHOIS lookup error:", err.message);
          return resolve(null);
        }
        resolve(data);
      });
    });

    let whoisNameservers = [];
    if (whoisData) {
      // Generic regex to capture multiline nameserver entries after known headers
      const nsSectionMatch = whoisData.match(
        /Name Server[s]?:\s*((?:.+\n)+?)(?:\n\n|$)/i
      );
      if (nsSectionMatch) {
        whoisNameservers = nsSectionMatch[1]
          .split(/\n/)
          .map((line) => line.trim().toLowerCase().replace(/\.$/, ""))
          .filter((line) => line.length > 0);
      } else {
        // fallback: extract all lines matching "Name Server:" individually
        const allNsMatches = whoisData.match(/Name Server:\s*(.+)/gi) || [];
        whoisNameservers = allNsMatches.map((l) =>
          l.split(":")[1].trim().toLowerCase().replace(/\.$/, "")
        );
      }
      whoisNameservers = [...new Set(whoisNameservers)];
    }

    // Allowed SparrowDNS nameservers example
    const allowedServers = ["ns1.exampledomain.com", "ns2.exampledomain.com"];
    const isUsingOurNS = whoisNameservers.some((ns) =>
      allowedServers.includes(ns)
    );

    return res.status(200).json({
      success: true,
      domain: normalizedDomain,
      currentNameservers: whoisNameservers,
      usingOurNameservers: isUsingOurNS,
      message:
        whoisNameservers.length === 0
          ? "⚠️ No nameservers found via WHOIS."
          : isUsingOurNS
          ? "✅ Domain is already using SparrowDNS nameservers."
          : "⚠️ Domain is NOT using SparrowDNS nameservers.",
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      domain: domain.toLowerCase().replace(/\.$/, ""),
      message: "⚠️ Failed to fetch nameservers safely.",
      currentNameservers: [],
      error: error.message,
    });
  }
};

////////////////////////////////////////////////////////////////////////////////

export const getZoneDNSQueries24h = async (req, res) => {
  try {
    let { zone } = req.body;
    if (!zone || typeof zone !== "string" || zone.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Zone is required and must be a non-empty string.",
      });
    }

    // Add trailing dot if missing for DNS canonical form
    if (!zone.endsWith(".")) {
      zone = zone + ".";
    }

    // Current UTC time
    const now = new Date();

    // Calculate time 24 hours ago
    const last24hStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch zone stats within last 24h inclusive
    const last24hStats = await ZoneStats.find({
      zone,
      owner: req.user?.id,
      hour: { $gte: last24hStart, $lte: now },
    });

    console.log("Fetched ZoneStats for 24h:", last24hStats);

    if (!last24hStats.length) {
      return res.status(404).json({
        status: false,
        message: `No stats found for zone "${zone}" in the last 24 hours.`,
      });
    }

    // Sum queries and calculate average latency
    const todayQueries = last24hStats.reduce(
      (sum, stat) => sum + stat.queries,
      0
    );
    const avgResponseTime = Math.round(
      last24hStats.reduce((sum, stat) => sum + stat.latency, 0) /
        last24hStats.length
    );

    // Calculate previous 24h window
    const prev24hStart = new Date(last24hStart.getTime() - 24 * 60 * 60 * 1000);
    const prev24hEnd = last24hStart;

    const prev24hStats = await ZoneStats.find({
      zone,
      hour: { $gte: prev24hStart, $lt: prev24hEnd },
    });

    const yesterdayQueries = prev24hStats.reduce(
      (sum, stat) => sum + stat.queries,
      0
    );

    // Calculate change %
    let changeFromYesterday = "N/A";
    if (yesterdayQueries === 0 && todayQueries > 0) {
      changeFromYesterday = "+100% (new queries)";
    } else if (yesterdayQueries > 0) {
      const percentChange =
        ((todayQueries - yesterdayQueries) / yesterdayQueries) * 100;
      changeFromYesterday =
        (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%";
    }

    return res.status(200).json({
      status: true,
      message: "Zone DNS query stats fetched successfully",
      data: {
        zone,
        totalQueries24h: todayQueries,
        avgResponseTime: isNaN(avgResponseTime)
          ? "N/A"
          : `${avgResponseTime}ms`,
        changeFromYesterday,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch zone DNS stats",
      error: error.message,
    });
  }
};

/**---------------------------  getDNSQueries24h  ---------------------------------------------------------- */

import { fetchDNSQueryStats } from "../services/powerdnsService.js";

export const getDNSQueries24h = async (req, res) => {
  try {
    const stats = await fetchDNSQueryStats();
    if (stats.status === false) {
      return res.status(502).json(stats);
    }
    return res.status(200).json({
      status: true,
      message: "DNS query stats fetched successfully",
      data: stats.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch DNS stats from PowerDNS",
      error: error.message,
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    // Prioritizes req.query.userId, then req.user.id if available
    const userId = req.query.userId || req.user.id;
    console.log("userId", userId);
    const { limit = 20, before, action } = req.query;

    // If filtering by user, ensure the user exists
    if (userId) {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({
          status: false,
          message: "User not found.",
        });
      }
    }

    // Build query object
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (before) query.timestamp = { $lt: new Date(before) };

    // Fetch records, sort by newest first, limit for dashboard
    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit) + 1)
      .select("-__v");

    const hasMore = activities.length > limit;
    if (hasMore) activities.pop();

    if (!activities.length) {
      return res.status(404).json({
        status: false,
        message: "No recent activity found for the given parameters.",
        count: 0,
        data: [],
        hasMore: false,
      });
    }

    // Return API response
    res.status(200).json({
      status: true,
      count: activities.length,
      data: activities,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Could not fetch recent activity.",
      error: error.message,
    });
  }
};

//  QUERY PERFORMANCE BY USERID (7 DAYS)  //
export const getQueryPerformance7dByUserId = async (req, res) => {
  try {
    const userId =
      (req.user && req.user.id) || req.body.userId || req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const zones = await ZoneMeta.find({ owner: userId })
      .select("zoneName")
      .lean();
    const zoneNames = zones.map((z) => z.zoneName).filter(Boolean);
    console.log("zoneNames", zoneNames);

    if (!zoneNames.length) {
      return res
        .status(404)
        .json({ success: false, message: "Zones not found" });
    }

    const stats = await ZoneStats.find({
      zone: { $in: zoneNames },
      hour: { $gte: sevenDaysAgo },
    })
      .select("queries latency")
      .lean();
    console.log("stats", stats);

    if (!stats || stats.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Stats not found" });
    }

    const totalQueries = stats.reduce((sum, s) => sum + (s.queries || 0), 0);

    const latencies = stats
      .map((s) => Number(s.latency || 0))
      .filter((v) => !Number.isNaN(v));
    const avgLatency = latencies.length
      ? Number(
          (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)
        )
      : 0;

    let p95Latency = 0;
    if (latencies.length) {
      const sorted = [...latencies].sort((a, b) => a - b);
      const idx = Math.ceil(0.95 * sorted.length) - 1;
      p95Latency = Number(sorted[Math.max(0, idx)].toFixed(2));
    }

    // Every record is a successful query!
    let successRatePercent = "N/A";
    if (totalQueries > 0) {
      successRatePercent = 100;
    }

    return res.json({
      success: true,
      query_performance: {
        period: "last_7_days",
        average_response_time_ms: avgLatency,
        p95_response_time_ms: p95Latency,
        success_rate_percent: successRatePercent,
        total_queries: totalQueries,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const TopDomains = async (req, res) => {
  try {
    // Date 24h ago from now
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Convert user id string to ObjectId to match in aggregation
    const ownerId = new mongoose.Types.ObjectId(req.user.id);

    const topDomains = await ZoneStats.aggregate([
      {
        $match: {
          hour: { $gte: twentyFourHoursAgo },
          owner: ownerId, // ensure ObjectId type matching
        },
      },
      {
        $group: {
          _id: "$zone",
          queries: { $sum: "$queries" },
        },
      },
      { $sort: { queries: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, zone: "$_id", queries: 1 } }, // only zone and queries fields
    ]);

    if (!topDomains || topDomains.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No domains found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Top domains fetched successfully.",
      data: topDomains,
    });
  } catch (err) {
    console.error("Error in TopDomains controller:", err.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error." });
  }
};

// Example controller method update (adjust to your route name)

export const deleteMultipleRecords = async (req, res) => {
  try {
    const { zone, records } = req.body;
    const result = await deleteMultipleRecordsService({ zone, records });

    if (result.notFound)
      return res.status(404).json({ status: false, message: "Zone not found" });
    if (result.invalidRecordsParam)
      return res
        .status(400)
        .json({ status: false, message: "records must be an array" });
    if (result.noRecordsProvided)
      return res
        .status(400)
        .json({ status: false, message: "No records provided" });
    if (result.noValidDeleteRequests)
      return res
        .status(400)
        .json({ status: false, message: "No valid delete targets" });
    if (result.noMatchingRecords)
      return res
        .status(404)
        .json({ status: false, message: "No matching records to delete" });

    return res.json({
      status: true,
      message: "Record values processed",
      data: result,
    });
  } catch (error) {
    console.error("deleteMultipleRecords error:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal error", error: error.message });
  }
};
