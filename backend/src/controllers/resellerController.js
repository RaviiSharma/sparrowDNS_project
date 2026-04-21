import Reseller from "../models/resellerModel.js";
import User from "../models/userModel.js";

// Get all resellers
export const getAllResellers = async (req, res) => {
  try {
    const resellers = await Reseller.find()
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: resellers.length,
      data: resellers,
    });
  } catch (error) {
    console.error("Error fetching resellers:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching resellers",
      error: error.message,
    });
  }
};

// Get reseller by ID
export const getResellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const reseller = await Reseller.findById(id).populate(
      "userId",
      "username email firstName lastName",
    );

    if (!reseller) {
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    res.json({
      status: true,
      data: reseller,
    });
  } catch (error) {
    console.error("Error fetching reseller:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching reseller",
      error: error.message,
    });
  }
};

// Create new reseller
export const createReseller = async (req, res) => {
  try {
    const { name, email, userId, plan = "Pro", whitelabel, limits } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if reseller with this email already exists
    const existingReseller = await Reseller.findOne({ email });
    if (existingReseller) {
      return res.status(400).json({
        status: false,
        message: "Reseller with this email already exists",
      });
    }

    const reseller = new Reseller({
      name,
      email,
      userId,
      plan,
      whitelabel: whitelabel || {},
      limits: limits || {},
    });

    await reseller.save();

    res.status(201).json({
      status: true,
      message: "Reseller created successfully",
      data: reseller,
    });
  } catch (error) {
    console.error("Error creating reseller:", error);
    res.status(500).json({
      status: false,
      message: "Error creating reseller",
      error: error.message,
    });
  }
};

// Update reseller
export const updateReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reseller = await Reseller.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!reseller) {
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    res.json({
      status: true,
      message: "Reseller updated successfully",
      data: reseller,
    });
  } catch (error) {
    console.error("Error updating reseller:", error);
    res.status(500).json({
      status: false,
      message: "Error updating reseller",
      error: error.message,
    });
  }
};

// Delete reseller
export const deleteReseller = async (req, res) => {
  try {
    const { id } = req.params;

    const reseller = await Reseller.findByIdAndDelete(id);

    if (!reseller) {
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    res.json({
      status: true,
      message: "Reseller deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reseller:", error);
    res.status(500).json({
      status: false,
      message: "Error deleting reseller",
      error: error.message,
    });
  }
};

// Get reseller statistics
export const getResellerStats = async (req, res) => {
  try {
    const totalResellers = await Reseller.countDocuments();
    const activeResellers = await Reseller.countDocuments({ status: "active" });
    const suspendedResellers = await Reseller.countDocuments({
      status: "suspended",
    });

    // Calculate total revenue
    const resellers = await Reseller.find();
    const totalRevenue = resellers.reduce(
      (sum, r) => sum + (r.revenue.monthly || 0),
      0,
    );
    const totalTenants = resellers.reduce(
      (sum, r) => sum + (r.usage.tenants || 0),
      0,
    );
    const totalZones = resellers.reduce(
      (sum, r) => sum + (r.usage.zones || 0),
      0,
    );

    res.json({
      status: true,
      data: {
        totalResellers,
        activeResellers,
        suspendedResellers,
        totalRevenue,
        totalTenants,
        totalZones,
      },
    });
  } catch (error) {
    console.error("Error fetching reseller stats:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching reseller statistics",
      error: error.message,
    });
  }
};

// Update reseller usage
export const updateResellerUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenants, zones, queriesMonth } = req.body;

    const reseller = await Reseller.findById(id);
    if (!reseller) {
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    if (tenants !== undefined) reseller.usage.tenants = tenants;
    if (zones !== undefined) reseller.usage.zones = zones;
    if (queriesMonth !== undefined) reseller.usage.queriesMonth = queriesMonth;

    await reseller.save();

    res.json({
      status: true,
      message: "Reseller usage updated successfully",
      data: reseller,
    });
  } catch (error) {
    console.error("Error updating reseller usage:", error);
    res.status(500).json({
      status: false,
      message: "Error updating reseller usage",
      error: error.message,
    });
  }
};
