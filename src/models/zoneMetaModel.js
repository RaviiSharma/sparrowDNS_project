import mongoose from "mongoose";
const { Schema } = mongoose;

const zoneMetaSchema = new Schema({
  zoneName: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  description: String,
  tags: [String],
  syncedWithPDNS: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("ZoneMeta", zoneMetaSchema);
