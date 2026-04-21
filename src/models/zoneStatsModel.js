import mongoose from 'mongoose';
const zoneStatsSchema = new mongoose.Schema({
  zone: { type: String, required: true, index: true },
  hour: { type: Date, required: true, index: true },
  queries: { type: Number, default: 0 },
  latency: { type: Number, default: 0 }
});
export default mongoose.model('ZoneStats', zoneStatsSchema);
