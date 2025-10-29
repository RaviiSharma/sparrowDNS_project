import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
  hour: { type: Date, required: true, index: true, unique:true },
  dnsQueries: Number,
  latency: Number
});



export default mongoose.model('Stats', StatsSchema);

