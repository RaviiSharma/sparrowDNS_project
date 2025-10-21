import mongoose from "mongoose";
const { Schema } = mongoose;

const activityLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  target: String,
  details: Schema.Types.Mixed, // flexible for record/zone data
  ip: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);
