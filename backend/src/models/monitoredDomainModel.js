// models/monitoredDomainModel.js
import mongoose from "mongoose";
const { Schema } = mongoose;
const monitoredDomainSchema = new Schema({
  domain: { type: String, required: true, unique: true, index: true },
   owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  alertEmails: [{ type: String }],
  lastCheck: { type: Date },
  lastWhois: { type: Schema.Types.Mixed },
  lastAlertSent: { type: Date }
});
export default mongoose.model("MonitoredDomain", monitoredDomainSchema);
