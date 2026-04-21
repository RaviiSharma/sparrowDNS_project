
// controllers/admin/adminPayments.js
import User from "../../models/userModel.js";

export const getAllPayments = async (req, res) => {
  try {
    const users = await User.find({}, { payments: 1, username: 1 });

    return res.status(200).json({
      status: true,
      users
    });
  } catch (err) {
    console.error("Admin getAllPayments:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

export const getPaymentsByUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, {
      payments: 1,
      username: 1
    });

    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    return res.status(200).json({
      status: true,
      payments: user.payments
    });
  } catch (err) {
    console.error("Admin getPaymentsByUser:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// MANUAL PLAN CHANGE
export const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      { plan },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Plan updated",
      user: updated
    });
  } catch (err) {
    console.error("Admin updateUserPlan:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
