import express from "express";
import { registerUser, loginUser, getUserProfile, listUsers } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", authMiddleware, getUserProfile);

// List all users (Admin)
router.get("/list", listUsers);

export default router;
