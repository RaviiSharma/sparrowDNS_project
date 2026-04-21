import mongoose from "mongoose";

const { Schema } = mongoose;

const webhookSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    events: [
      {
        type: String,
        enum: [
          "zone.created",
          "zone.updated",
          "zone.deleted",
          "record.created",
          "record.updated",
          "record.deleted",
          "health.failed",
          "health.recovered",
          "domain.expired",
          "domain.expiring",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "failed"],
      default: "active",
    },
    secret: {
      type: String,
      required: true,
    },
    lastTriggered: Date,
    failureCount: {
      type: Number,
      default: 0,
    },
    deliveries: [
      {
        timestamp: Date,
        event: String,
        status: { type: String, enum: ["success", "failed"] },
        responseCode: Number,
        responseTime: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Webhook", webhookSchema);
