// models/whoisHistoryModel.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const whoisHistorySchema = new Schema({
  domain: { type: String, required: true, index: true },
  whoisData: { type: Schema.Types.Mixed, required: true },
  checkedAt: { type: Date, default: Date.now }
});

export default mongoose.model("WhoisHistory", whoisHistorySchema);
