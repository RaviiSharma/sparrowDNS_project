import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be at least 2 characters long'],
    maxlength: [30, 'Username must not exceed 30 characters'],
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name must not exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name must not exceed 50 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name must not exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio must not exceed 500 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number must not exceed 20 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL must not exceed 200 characters']
  },
  profilePhoto: {
    type: String,
    trim: true,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },
  role: {
    type: String,
    enum: ["superadmin", "admin", "viewer"],
    default: "admin",
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Business'],
    default: 'Free'
  },
  billing: {
    razorpayId: String,
    razorpaySubscriptionId: String,
    renewalDate: Date,
    active: { type: Boolean, default: true }
  },
  queryUsage: {
    count: { type: Number, default: 0 },
    period: String // e.g. '2025-11' for monthly reset
  },
  payments: [
    {
      orderId: String,             // Razorpay order ID
      paymentId: String,           // Razorpay payment ID (filled on successful payment)
      amount: Number,
      currency: String,
      plan: String,
      status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: Date,
    }
  ]
}, {
  timestamps: true,
  versionKey: false
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
