import User from "../models/userModel.js";
import ZoneMeta from "../models/zoneMetaModel.js"; // adjust if named differently
import Plan from "../models/planModel.js";
import ZoneStats from "../models/zoneStatsModel.js";

//*********************************************UPDATE USER PROFILE******************************************** */

export const updateProfile = async (req, res) => {
  try {
    const allowed = [
      "firstName",
      "lastName",
      "company",
      "bio",
      "phone",
      "website",
      "profilePhoto",
    ];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const zoneCount = await ZoneMeta.countDocuments({ userId: user._id }).catch(
      () => 0
    );
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthlyQueryCount =
      user.queryUsage?.period === currentPeriod ? user.queryUsage.count : 0;

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      bio: user.bio,
      phone: user.phone,
      website: user.website,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      zoneCount,
      monthlyQueryCount,
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const zoneCount = await ZoneMeta.countDocuments({ owner: user._id }).catch(
      () => 0
    );

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthlyQueryCount =
      user.queryUsage?.period === currentPeriod ? user.queryUsage.count : 0;

    const userData = {
      ...user.toObject(),
      zoneCount,
      monthlyQueryCount,
    };
    return res.json({ success: true, user: userData });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ********************************************* BILLING STATUS ********************************************* //
// GET /api/user/billing-status
// Returns only the specified JSON object (no wrapper) containing billing_status
export const getBillingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan billing queryUsage"
    );
    if (!user) {
      return res.status(404).json({ billing_status: null });
    }

    // Fetch plan details
    let planDoc = null;
    if (user.plan) {
      planDoc = await Plan.findOne({ name: user.plan }).lean();
    }

    // Derive monthly price
    let planPriceMonthly = 0;
    if (planDoc) {
      if (planDoc.billingCycle === "per year") {
        planPriceMonthly = Number((planDoc.price / 12).toFixed(2));
      } else {
        // assumes price already monthly or one-time (then just show price)
        planPriceMonthly = planDoc.price;
      }
    }

    // Count zones owned by user
    const zonesUsed = await ZoneMeta.countDocuments({ owner: user._id }).catch(
      () => 0
    );

    // Query usage for current month
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const queriesUsedThisMonth =
      user.queryUsage?.period === currentPeriod
        ? user.queryUsage.count || 0
        : 0;

    const billing_status = {
      plan_name: planDoc?.name || user.plan || "Free",
      plan_price_monthly: planPriceMonthly,
      plan_status: user.billing?.active ? "Active" : "Inactive",
      queries_used_this_month: queriesUsedThisMonth,
      queries_limit_monthly: planDoc?.queryLimit || 0,
      zones_used: zonesUsed,
      zones_limit: planDoc?.domainLimit || 0,
    };

    return res.json({ billing_status });
  } catch (e) {
    return res.status(500).json({ billing_status: null });
  }
};


