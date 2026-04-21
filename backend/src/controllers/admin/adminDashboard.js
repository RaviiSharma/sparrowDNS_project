
// controllers/admin/adminDashboard.js
import User from "../../models/userModel.js";
import ZoneMeta from "../../models/zoneMetaModel.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const domains = await ZoneMeta.countDocuments();
    const proUsers = await User.countDocuments({ plan: "Pro" });
    const businessUsers = await User.countDocuments({ plan: "Business" });

    return res.status(200).json({
      status: true,
      stats: {
        totalUsers: users,
        totalDomains: domains,
        proUsers,
        businessUsers
      }
    });
  } catch (err) {
    console.error("Admin Dashboard:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
