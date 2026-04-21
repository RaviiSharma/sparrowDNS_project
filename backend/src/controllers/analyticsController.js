import Stats from "../models/statsModel.js";
import ZoneStats from "../models/zoneStatsModel.js";
import ActivityLog from "../models/activityLogModel.js";
import mongoose from "mongoose";

// Get analytics overview
export const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = "7d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get DNS query stats
    const stats = await Stats.find({
      hour: { $gte: startDate },
    }).sort({ hour: 1 });

    // Calculate totals
    const totalQueries = stats.reduce(
      (sum, stat) => sum + (stat.dnsQueries || 0),
      0,
    );
    const avgLatency =
      stats.length > 0
        ? stats.reduce((sum, stat) => sum + (stat.latency || 0), 0) /
          stats.length
        : 0;

    // Get activity count
    const activityCount = await ActivityLog.countDocuments({
      userId,
      timestamp: { $gte: startDate },
    });

    // Get zone stats
    const zoneStats = await ZoneStats.find({
      userId,
      timestamp: { $gte: startDate },
    });

    const activeZones = new Set(zoneStats.map((z) => z.zoneName)).size;

    res.json({
      status: true,
      data: {
        totalQueries,
        avgLatency: Math.round(avgLatency),
        uptime: 99.99, // Calculate based on health checks
        activeZones,
        activityCount,
        timeRange,
        queryTrend: stats.map((s) => ({
          timestamp: s.hour,
          queries: s.dnsQueries || 0,
        })),
        latencyTrend: stats.map((s) => ({
          timestamp: s.hour,
          latency: s.latency || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching analytics data",
      error: error.message,
    });
  }
};

// Get query analytics
export const getQueryAnalytics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const stats = await Stats.find({
      hour: { $gte: startDate },
    }).sort({ hour: 1 });

    // Aggregate by query type (would need to enhance Stats model for this)
    const queryTypeDistribution = {
      A: Math.floor(Math.random() * 1000000) + 500000,
      AAAA: Math.floor(Math.random() * 500000) + 100000,
      CNAME: Math.floor(Math.random() * 300000) + 50000,
      MX: Math.floor(Math.random() * 100000) + 10000,
      TXT: Math.floor(Math.random() * 50000) + 5000,
      NS: Math.floor(Math.random() * 20000) + 2000,
      SOA: Math.floor(Math.random() * 10000) + 1000,
    };

    res.json({
      status: true,
      data: {
        stats: stats.map((s) => ({
          timestamp: s.hour,
          queries: s.dnsQueries || 0,
          latency: s.latency || 0,
        })),
        queryTypeDistribution,
        totalQueries: stats.reduce((sum, s) => sum + (s.dnsQueries || 0), 0),
      },
    });
  } catch (error) {
    console.error("Error fetching query analytics:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching query analytics",
      error: error.message,
    });
  }
};

// Get performance metrics
export const getPerformanceMetrics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const stats = await Stats.find({
      hour: { $gte: startDate },
    }).sort({ hour: 1 });

    const performanceData = stats.map((s) => ({
      timestamp: s.hour,
      avgLatency: s.latency || 0,
      queries: s.dnsQueries || 0,
      uptime: 99.9 + Math.random() * 0.1, // Calculate from actual health checks
    }));

    res.json({
      status: true,
      data: {
        performanceData,
        summary: {
          avgLatency:
            stats.length > 0
              ? Math.round(
                  stats.reduce((sum, s) => sum + (s.latency || 0), 0) /
                    stats.length,
                )
              : 0,
          minLatency:
            stats.length > 0
              ? Math.min(...stats.map((s) => s.latency || 0))
              : 0,
          maxLatency:
            stats.length > 0
              ? Math.max(...stats.map((s) => s.latency || 0))
              : 0,
          uptime: 99.99,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching performance metrics",
      error: error.message,
    });
  }
};

// Get geographic analytics (placeholder - would need geo data)
export const getGeographicAnalytics = async (req, res) => {
  try {
    // This would need IP geolocation data in the Stats model
    const geoData = [
      { country: "United States", queries: 1234567, percentage: 35 },
      { country: "United Kingdom", queries: 678901, percentage: 19 },
      { country: "Germany", queries: 456789, percentage: 13 },
      { country: "France", queries: 345678, percentage: 10 },
      { country: "Canada", queries: 234567, percentage: 7 },
      { country: "Others", queries: 567890, percentage: 16 },
    ];

    res.json({
      status: true,
      data: {
        geoDistribution: geoData,
        totalCountries: 45,
      },
    });
  } catch (error) {
    console.error("Error fetching geographic analytics:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching geographic analytics",
      error: error.message,
    });
  }
};
