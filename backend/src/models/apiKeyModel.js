import mongoose from "mongoose";
import crypto from "crypto";
const { Schema } = mongoose;

const apiKeySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scope: {
    type: String,
    enum: ["Full Access", "Read Only", "Write Only"],
    default: "Read Only",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "revoked"],
    default: "active",
  },
  lastUsed: {
    type: Date,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: null, // null means never expires
  },
}, { timestamps: true , versionKey:false});

// Generate API key before saving
apiKeySchema.pre('save', function(next) {
  if (this.isNew && !this.key) {
    this.key = `sk_${this.scope === 'Full Access' ? 'live' : 'test'}_${crypto.randomBytes(16).toString('hex')}`;
  }
  next();
});

// Method to update last used
apiKeySchema.methods.updateLastUsed = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

export default mongoose.model("ApiKey", apiKeySchema);
