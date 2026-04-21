import mongoose from "mongoose";

import MonitoredDomain from "../models/monitoredDomainModel.js";
import DomainAlertLog from "../models/domainAlertLogModel.js";
import ZoneMeta from "../models/zoneMetaModel.js";
import ZoneStats from "../models/zoneStatsModel.js";
import ActivityLog from "../models/activityLogModel.js";

export const addDomainsToMonitore = async (req, res) => {
  try {
    const { domain, alertEmails, latency } = req.body;
    const userId = req.user.id;
    const triallingDomain = domain.endsWith(".") ? domain : domain + ".";

    if (!triallingDomain || !alertEmails || !Array.isArray(alertEmails)) {
      return res.status(400).json({
        status: false,
        error: "Missing domain or alert emails (array required)",
      });
    }

    // Check zone ownership for user
    const zoneExists = await ZoneMeta.exists({
      zoneName: triallingDomain,
      owner: userId,
    });
    if (!zoneExists) {
      return res.status(404).json({
        status: false,
        message: "Zone not found for this user in DB",
      });
    }

    // Check if domain already monitored by this user
    const domainExists = await MonitoredDomain.exists({
      domain: triallingDomain,
      owner: userId,
    });
    if (domainExists) {
      return res.status(400).json({
        status: false,
        message: "Domain already exists in DB",
      });
    }

    // Create new monitored domain record
    const newDomain = await MonitoredDomain.create({
      domain: triallingDomain,
      alertEmails,
      owner: userId,
    });

    // Round current time to start of hour for stats
    const roundedHour = new Date();
    roundedHour.setMinutes(0, 0, 0);

    const lastMeasuredLatency = latency || 0;

    // Upsert zone stats document for this domain/user/hour, including keys in $setOnInsert for strict mode
    await ZoneStats.updateOne(
      { zone: triallingDomain, owner: userId, hour: roundedHour },
      {
        $inc: { queries: 1 },
        $set: { latency: lastMeasuredLatency },
        $setOnInsert: {
          domain: triallingDomain,
          owner: userId,
          hour: roundedHour,
        },
      },
      { upsert: true }
    );

    // Log this domain add action
    await ActivityLog.create({
      userId,
      action: "ADD_DOMAIN_MONITOR",
      target: triallingDomain,
      details: { domain: triallingDomain, alertEmails },
      ip: req.ip || "unknown",
    });

    return res.status(201).json({
      status: true,
      message: "Domain monitored successfully",
      data: newDomain,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: false,
        error: "Domain already exists in DB",
      });
    }
    return res.status(500).json({
      status: false,
      error: "Failed to add domain to monitor",
      details: err.message,
    });
  }
};

export const listMonitoredDomains = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userId:", userId);
    const domains = await MonitoredDomain.find({ owner: userId }).select(
      "-__v"
    );
    return res.status(200).json({
      status: true,
      message: "Monitored domains fetched successfully",
      data: domains,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: "Failed to fetch monitored domains",
      details: err.message,
    });
  }
};

export const updateEmailsOfDomain = async (req, res) => {
  const { domain } = req.body;
  const { alertEmails } = req.body;
  const triallingDomain = domain.endsWith(".") ? domain : domain + ".";

  console.log("triallingDomain:", triallingDomain);

  if (!triallingDomain || !alertEmails || !Array.isArray(alertEmails)) {
    return res.status(400).json({
      status: false,
      error: "Missing domain or alert emails (array required)",
    });
  }

  try {
    const doc = await MonitoredDomain.findOneAndUpdate(
      { domain: triallingDomain, owner: req.user.id },
      { alertEmails },
      { new: true }
    ).select("-__v");

    if (!doc) {
      return res.status(404).json({
        status: false,
        error: "Domain not found",
      });
    }

    // Log this update
    await ActivityLog.create({
      userId: req.user.id,
      action: "UPDATE_ALERT_EMAILS",
      target: triallingDomain,
      details: { domain: triallingDomain, alertEmails },
      ip: req.ip || "unknown",
    });

    // Update zone stats (update count)
    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
    await ZoneStats.updateOne(
      { zone: triallingDomain, owner: req.user.id, hour: roundedHour },
      { $inc: { updates: 1 } },
      { upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: "Alert emails updated successfully",
      data: doc,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: "Failed to update alert emails",
      details: err.message,
    });
  }
};




export const log = async (req, res) => {
  try {
    
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Find the latest 5 logs for the user, any domain
    const latestLogs = await DomainAlertLog.find({ owner: userId })
      .sort({ checkedAt: -1 })
      .limit(2);

    if (!latestLogs.length) {
      return res.status(404).json({
        status: false,
        message: "No logs found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Fetched latest 5 domain alert logs for current user",
      data: latestLogs,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: "Failed to fetch domain logs",
      details: err.message,
    });
  }
};


