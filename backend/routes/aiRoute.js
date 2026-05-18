import express from "express"
import { chatWithAI } from "../controllers/aiController.js"
import { analyzeDish } from "../controllers/dishAnalyzerController.js"
import multer from "multer"

const aiRouter = express.Router();

// Multer setup for image upload (Memory storage for Serverless stability)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

aiRouter.post("/chat", upload.single("image"), chatWithAI);
aiRouter.post("/analyze-dish", analyzeDish);

export default aiRouter;
