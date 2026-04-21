import mongoose from "mongoose";
const { Schema } = mongoose;

const zoneMetaSchema = new Schema({
  zoneName: {
    type: String,
    required: true,
    unique: true,
    index:true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: String,
  records:{
    type: Schema.Types.Array,
  },
  tags: [String],
  syncedWithPDNS: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("ZoneMeta", zoneMetaSchema);
