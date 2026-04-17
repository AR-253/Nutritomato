import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood, seedDatabase } from "../controllers/foodController.js";

const foodRouter = express.Router();

import { storage } from "../config/cloudinary.js";
import { addFood, listFood, removeFood, seedDatabase, updateFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// 📸 Cloudinary storage engine (Updated for Deployment)
const upload = multer({ storage: storage });

// 🧾 Routes
foodRouter.post("/add", upload.single("image"), addFood);  // Add food
foodRouter.get("/list", listFood);                          // Get all foods
foodRouter.post("/remove", removeFood);                     // Remove food
foodRouter.post("/update", upload.single("image"), updateFood); // Update food
foodRouter.post("/seed", seedDatabase);                     // Seed Database

export default foodRouter;
