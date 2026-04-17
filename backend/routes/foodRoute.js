import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood, seedDatabase } from "../controllers/foodController.js";

const foodRouter = express.Router();

// 📸 Image storage engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// 🧾 Routes
foodRouter.post("/add", upload.single("image"), addFood);  // Add food
foodRouter.get("/list", listFood);                          // Get all foods
foodRouter.post("/remove", removeFood);                     // Remove food
foodRouter.post("/update", upload.single("image"), updateFood); // Update food
foodRouter.post("/seed", seedDatabase);                     // Seed Database

export default foodRouter;
