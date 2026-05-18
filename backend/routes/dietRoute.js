import express from "express"
import authMiddleware from "../middleware/auth.js"
import { saveDietPlan, getDietPlan, logCalories, getDietHistory, logWater, getWeeklyReport, getCustomReport, resetDailyLog } from "../controllers/dietController.js"

const dietRouter = express.Router();

dietRouter.post("/save", authMiddleware, saveDietPlan);
dietRouter.post("/get", authMiddleware, getDietPlan);
dietRouter.post("/log-calories", authMiddleware, logCalories);
dietRouter.post("/history", authMiddleware, getDietHistory);
dietRouter.post("/log-water", authMiddleware, logWater);
dietRouter.post("/weekly-report", authMiddleware, getWeeklyReport);
dietRouter.post("/custom-report", authMiddleware, getCustomReport);
dietRouter.post("/reset-daily", authMiddleware, resetDailyLog);

export default dietRouter;
