
// controllers/admin/adminUsers.js
import User from "../../models/userModel.js";
import ZoneMeta from "../../models/zoneMetaModel.js";

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      status: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error("Admin getAllUsers:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// GET ONE USER
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    return res.status(200).json({ status: true, user });
  } catch (err) {
    console.error("Admin getUserById:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// UPDATE USER (role, plan, billing, profile)
export const updateUser = async (req, res) => {
  try {
    const updateData = req.body; // allow admin to update anything except password here

    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ status: false, message: "User not found" });

    return res.status(200).json({
      status: true,
      message: "User updated successfully",
      user: updated
    });
  } catch (err) {
    console.error("Admin updateUser:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// DELETE USER + ALL ZONES
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    await ZoneMeta.deleteMany({ owner: userId });
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      status: true,
      message: "User and their domains deleted successfully"
    });
  } catch (err) {
    console.error("Admin deleteUser:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
