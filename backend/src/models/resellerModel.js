import mongoose from "mongoose";

const { Schema } = mongoose;

const resellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    plan: {
      type: String,
      enum: ["Pro", "Business", "Enterprise"],
      default: "Pro",
    },
    whitelabel: {
      enabled: { type: Boolean, default: false },
      customNameservers: [String],
      customDomain: String,
    },
    limits: {
      maxTenants: { type: Number, default: 10 },
      maxZonesPerTenant: { type: Number, default: 50 },
      maxQueriesPerMonth: { type: Number, default: 1000000 },
    },
    usage: {
      tenants: { type: Number, default: 0 },
      zones: { type: Number, default: 0 },
      queriesMonth: { type: Number, default: 0 },
    },
    revenue: {
      monthly: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    settings: {
      allowSubaccounts: { type: Boolean, default: true },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Reseller", resellerSchema);
