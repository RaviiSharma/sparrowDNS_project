import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
  phone?: string;
  website?: string;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'superadmin' | 'admin' | 'viewer';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
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
}, {
  timestamps: true,
  versionKey: false
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});


const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
