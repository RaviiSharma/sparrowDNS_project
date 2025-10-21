import mongoose from "mongoose";
const { Schema } = mongoose;

const settingsSchema = new Schema({
  defaultTTL: {
    type: Number,
    default: 3600,
  },
  pdnsServer: {
    type: String,
    default: "localhost",
  },
  pdnsApiUrl: {
    type: String,
    required: true,
  },
  pdnsApiKey: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
