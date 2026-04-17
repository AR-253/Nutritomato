import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dietModel from "../models/dietModel.js";
// 1. Nodemailer Import karein
import nodemailer from "nodemailer";

// 2. Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Apne .env file mein email dalein
    pass: process.env.EMAIL_PASS  // Gmail App Password use karein
  }
});

// Create JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ---------------------------
// Register new user
// ---------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, weight, height, activity, goal } = req.body;

    // --- Validation Start ---
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing required fields (Name, Email, Password)" });
    }

    // Email format validation (Regex)
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: "Please enter a valid email address" });
    }

    // Password length validation
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters long" });
    }
    // --- Validation End ---

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      age: age || null,
      gender: gender || "Male",
      weight: weight || null,
      height: height || null,
      activity: activity || "Sedentary",
      goal: goal || "Maintain"
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    // -----------------------------
    // Calculate & Save Diet Plan
    // -----------------------------
    if (age && weight && height && activity && goal) {
      try {
        let bmr;
        if (gender === 'Male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        let tdee;
        switch (activity) {
          case 'Sedentary': tdee = bmr * 1.2; break;
          case 'Light': tdee = bmr * 1.375; break;
          case 'Moderate': tdee = bmr * 1.55; break;
          case 'Active': tdee = bmr * 1.725; break;
          default: tdee = bmr * 1.2;
        }

        let targetCalories = tdee;
        if (goal === 'Lose') targetCalories -= 500;
        if (goal === 'Gain') targetCalories += 500;

        const newPlan = {
          calories: Math.round(targetCalories),
          protein: Math.round((targetCalories * 0.3) / 4),
          carbs: Math.round((targetCalories * 0.4) / 4),
          fats: Math.round((targetCalories * 0.3) / 9)
        };

        // Save to Diet Model
        const newDiet = new dietModel({
          userId: user._id,
          userInfo: { age, gender, weight, height, activity, goal },
          plan: newPlan
        });
        await newDiet.save();

      } catch (dietError) {
        console.error("Error creating initial diet plan:", dietError);
        // Continue registration even if diet plan fails
      }
    }

    // -----------------------------
    // 3. Send Welcome Email (Nodemailer)
    // -----------------------------
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our App!',
      text: `Hello ${name},\n\nThank you for registering. Your account has been created successfully!\n\nRegards,\nFYP Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error: ", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({
      success: true,
      token,
      name: user.name,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in registration" });
  }
};

// ---------------------------
// Login user
// ---------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation Start ---
    if (!email || !password) {
      return res.json({ success: false, message: "Email and Password are required" });
    }
    // --- Validation End ---

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Create token
    const token = createToken(user._id);

    // (Optional) Login Alert Email yahan add kiya ja sakta hai

    res.json({
      success: true,
      token,
      name: user.name,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in login" });
  }
};

// ---------------------------
// Get user profile
// ---------------------------
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch user profile" });
  }
};

// ---------------------------
// List all users (Admin)
// ---------------------------
export const listUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching user list" });
  }
};