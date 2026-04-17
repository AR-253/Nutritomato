import express from "express"
import authMiddleware from "../middleware/auth.js"
import { saveDietPlan, getDietPlan, logCalories, getDietHistory } from "../controllers/dietController.js"

const dietRouter = express.Router();

dietRouter.post("/save", authMiddleware, saveDietPlan);
dietRouter.post("/get", authMiddleware, getDietPlan);
dietRouter.post("/log-calories", authMiddleware, logCalories);
dietRouter.post("/history", authMiddleware, getDietHistory);

export default dietRouter;
