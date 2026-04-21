import mongoose from "mongoose";
const { Schema } = mongoose;

const zoneStatsSchema = new mongoose.Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  zone: { type: String, required: true, index: true },
  hour: { type: Date, required: true, index: true },
  queries: { type: Number, default: 0 },
  updates: { type: Number, default: 0 },
  latency: { type: Number, default: 0 },
});
export default mongoose.model("ZoneStats", zoneStatsSchema);
