import SecurityLog from "../models/securityLogModel.js";
import User from "../models/userModel.js";

// Get security logs for current user
export const getSecurityLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, event, status, severity } = req.query;

    const query = { userId };
    if (event) query.event = event;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const total = await SecurityLog.countDocuments(query);

    res.json({
      status: true,
      count: logs.length,
      total,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching security logs:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching security logs",
      error: error.message,
    });
  }
};

// Get all security logs (admin only)
export const getAllSecurityLogs = async (req, res) => {
  try {
    const { limit = 100, userId, event, status } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (event) query.event = event;
    if (status) query.status = status;

    const logs = await SecurityLog.find(query)
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const total = await SecurityLog.countDocuments(query);

    res.json({
      status: true,
      count: logs.length,
      total,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching all security logs:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching security logs",
      error: error.message,
    });
  }
};

// Log security event
export const logSecurityEvent = async (req, res) => {
  try {
    const {
      event,
      ip,
      userAgent,
      location,
      status = "success",
      details = {},
      severity = "low",
    } = req.body;

    const userId = req.user._id;

    const securityLog = new SecurityLog({
      userId,
      event,
      ip,
      userAgent,
      location,
      status,
      details,
      severity,
    });

    await securityLog.save();

    res.status(201).json({
      status: true,
      message: "Security event logged successfully",
      data: securityLog,
    });
  } catch (error) {
    console.error("Error logging security event:", error);
    res.status(500).json({
      status: false,
      message: "Error logging security event",
      error: error.message,
    });
  }
};

// Get security overview
export const getSecurityOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts for different event types
    const loginAttempts = await SecurityLog.countDocuments({
      userId,
      event: { $in: ["login_success", "login_failed"] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const failedLogins = await SecurityLog.countDocuments({
      userId,
      event: "login_failed",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const apiKeyEvents = await SecurityLog.countDocuments({
      userId,
      event: { $in: ["api_key_created", "api_key_rotated", "api_key_deleted"] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const suspiciousActivity = await SecurityLog.countDocuments({
      userId,
      event: "suspicious_activity",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Get last login
    const lastLogin = await SecurityLog.findOne({
      userId,
      event: "login_success",
    }).sort({ createdAt: -1 });

    // Get user security settings
    const user = await User.findById(userId).select("role");

    res.json({
      status: true,
      data: {
        loginAttempts,
        failedLogins,
        apiKeyEvents,
        suspiciousActivity,
        lastLogin: lastLogin
          ? {
              timestamp: lastLogin.createdAt,
              ip: lastLogin.ip,
              location: lastLogin.location,
            }
          : null,
        twoFactorEnabled: false, // Would need to add this to user model
        strongPassword: true, // Would need password strength check
        securityScore: Math.max(
          0,
          100 - failedLogins * 5 - suspiciousActivity * 10,
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching security overview:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching security overview",
      error: error.message,
    });
  }
};

// Get security statistics (admin only)
export const getSecurityStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalEvents = await SecurityLog.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const failedLogins = await SecurityLog.countDocuments({
      event: "login_failed",
      createdAt: { $gte: thirtyDaysAgo },
    });

    const suspiciousActivities = await SecurityLog.countDocuments({
      event: "suspicious_activity",
      createdAt: { $gte: thirtyDaysAgo },
    });

    const criticalEvents = await SecurityLog.countDocuments({
      severity: "critical",
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get event distribution
    const eventDistribution = await SecurityLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      status: true,
      data: {
        totalEvents,
        failedLogins,
        suspiciousActivities,
        criticalEvents,
        eventDistribution: eventDistribution.map((e) => ({
          event: e._id,
          count: e.count,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching security stats:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching security statistics",
      error: error.message,
    });
  }
};

// Helper function to create security log (can be used in other controllers)
export const createSecurityLog = async (
  userId,
  event,
  ip,
  additionalData = {},
) => {
  try {
    const securityLog = new SecurityLog({
      userId,
      event,
      ip,
      ...additionalData,
    });
    await securityLog.save();
    return securityLog;
  } catch (error) {
    console.error("Error creating security log:", error);
    return null;
  }
};
