import mongoose from "mongoose";
const { Schema } = mongoose;

const apiKeySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  permissions: [String],
  expiresAt: Date,
}, { timestamps: true });

export default mongoose.model("ApiKey", apiKeySchema);
