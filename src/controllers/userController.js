

import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//*********************************************USER REGISTRATION******************************************** */

export const userRegistration = async function(req, res) {
    try {
        const { username, email, password, role } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({ status: false, message: "Username, email, and password are required." });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ status: false, message: "Invalid email format." });
        }

        // Check if user already exists
        let existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ status: false, message: "User with this username or email already exists." });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = new UserModel({
            username,
            email,
            passwordHash,
            role: role || "admin", // Default role to 'admin' if not provided
        });

        const savedUser = await newUser.save();
        return res.status(201).json({ status: true, message: "User registered successfully.", userId: savedUser._id, data:savedUser });

    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};