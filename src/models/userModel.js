import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["superadmin", "admin", "viewer"],
    default: "admin",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
