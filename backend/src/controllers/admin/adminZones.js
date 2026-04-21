
// controllers/admin/adminZones.js
import User from "../../models/userModel.js";
import ZoneMeta from "../../models/zoneMetaModel.js";

export const getAllZones = async (req, res) => {
  try {
    const zones = await ZoneMeta.find().populate("owner", "username email");

    return res.status(200).json({
      status: true,
      count: zones.length,
      zones
    });
  } catch (err) {
    console.error("Admin getAllZones:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

export const getZonesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const zones = await ZoneMeta.find({ owner: userId });

    return res.status(200).json({
      status: true,
      count: zones.length,
      zones
    });
  } catch (err) {
    console.error("Admin getZonesByUser:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const zoneId = req.params.zoneId;

    await ZoneMeta.findByIdAndDelete(zoneId);

    return res.status(200).json({
      status: true,
      message: "Zone deleted successfully"
    });
  } catch (err) {
    console.error("Admin deleteZone:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// (Optional) Force sync or update zone
export const updateZone = async (req, res) => {
  try {
    const updateData = req.body;

    const updated = await ZoneMeta.findByIdAndUpdate(
      req.params.zoneId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Zone updated successfully",
      zone: updated
    });
  } catch (err) {
    console.error("Admin updateZone:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
