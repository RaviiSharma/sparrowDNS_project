// models/domainAlertLogModel.js
import mongoose from "mongoose";
const { Schema } = mongoose;
const domainAlertLogSchema = new mongoose.Schema(
  {
    domain: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: String,
    emailSentTo: [String],
    changes: Schema.Types.Mixed,
    checkedAt: Date,
    error: String, // if any
  },
  { timestamps: true }
);

export default mongoose.model("DomainAlertLog", domainAlertLogSchema);
