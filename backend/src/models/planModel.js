import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name:       { type: String, required: true, unique: true }, // "Free", "Pro", "Business", "Enterprise"
  description:{ type: String }, // Optional text/marketing
  price:      { type: Number, required: true }, // e.g. 99.00
  billingCycle:{ type: String, required: true }, // "forever", "per month", "per year"
  planId:     { type: String }, // Razorpay or Stripe plan ID (nullable for "Free")
  domainLimit:{ type: Number, required: true },
  queryLimit: { type: Number, required: true },
  features:   [{ type: String }], // e.g. ["API access", "Analytics"]
  isActive:   { type: Boolean, default: true }, // allow disabling/hiding plans
  createdAt:  { type: Date, default: Date.now }
}, { versionKey: false });

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Plan;
