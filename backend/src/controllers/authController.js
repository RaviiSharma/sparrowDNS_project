

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/login — Login user and set auth cookie
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    // IMPORTANT: include role inside JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,        // <-- REQUIRED FOR ADMIN CHECK
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 * 1000,
      sameSite: "strict",
      path: "/",
    });

    // Send user data
    const userData = {
      _id: user._id,
      auth_token: token,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      bio: user.bio,
      phone: user.phone,
      website: user.website,
      profilePhoto: user.profilePhoto,
      role: user.role,               // <-- MUST RETURN THIS TOO
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};




// POST /api/auth/register — Register new user and set auth cookie
export const registerUser = async (req, res) => {
  try {
    const { username, email, password,role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // ⚠️ IMPORTANT: Hash the password before saving!
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('role',role);
    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword, // Save hashed password
      role:role || 'admin', // Default role is 'user' if not provided
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set auth cookie
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week in milliseconds
      path: "/",
      sameSite: "strict", // Recommended for security
    });

    // Return user data (excluding sensitive fields)
    const userData = {
      _id: user._id,
      role: user.role,
      auth_token:token,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      bio: user.bio,
      phone: user.phone,
      website: user.website,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};



export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      bio: user.bio,
      phone: user.phone,
      website: user.website,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// controllers/logoutController.js

// POST /api/auth/logout — Clear auth cookie to log user out
export const logoutUser = (req, res) => {
  try {
    // Clear the auth-token cookie by setting it to empty and expiring immediately
    res.clearCookie("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully, Cleared cookie",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout",
    });
  }
};





