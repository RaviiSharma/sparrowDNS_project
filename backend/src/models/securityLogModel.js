import mongoose from "mongoose";

const { Schema } = mongoose;

const securityLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: [
        "login_success",
        "login_failed",
        "password_changed",
        "password_reset",
        "api_key_created",
        "api_key_rotated",
        "api_key_deleted",
        "two_factor_enabled",
        "two_factor_disabled",
        "session_created",
        "session_expired",
        "suspicious_activity",
        "account_locked",
      ],
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: String,
    location: {
      country: String,
      city: String,
    },
    status: {
      type: String,
      enum: ["success", "failed", "warning"],
      default: "success",
    },
    details: Schema.Types.Mixed,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
securityLogSchema.index({ userId: 1, createdAt: -1 });
securityLogSchema.index({ event: 1 });
securityLogSchema.index({ status: 1 });

export default mongoose.model("SecurityLog", securityLogSchema);
