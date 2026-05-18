import dotenv from 'dotenv'
dotenv.config() 
import express from "express"
import cors from "cors"
import fs from 'fs'
import multer from 'multer'
import axios from 'axios'
import FormData from 'form-data'
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoutes.js"
import orderRouter from "./routes/orderRoute.js"
import dietRouter from "./routes/dietRoute.js"
import aiRouter from "./routes/aiRoute.js"
import cartRouter from "./routes/cartRoute.js"
import { identifyFoodWithGemini } from "./utils/geminiHelper.js"

const app = express()
const port = 4000

// ✅ Production Health Check
app.get("/api/health-check", (req, res) => {
  res.status(200).json({ success: true, message: "Server is ALIVE" });
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.use("/uploads", express.static("uploads"))

connectDB();

app.post("/api/food/predict-nutrition", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        const envUrl = (process.env.AI_SERVICE_URL || '').trim();
        const targets = [
            'http://127.0.0.1:7860',
            envUrl,
            'http://localhost:7860'
        ].filter(t => t);

        let flaskResponse = null;
        let lastError = null;

        // 1. Try Local Model First
        for (const target of targets) {
            try {
                const baseUrl = target.endsWith('/') ? target.slice(0, -1) : target;
                const fullUrl = `${baseUrl}/predict`;
                
                const formData = new FormData();
                formData.append('file', req.file.buffer, {
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                });

                flaskResponse = await axios.post(fullUrl, formData, {
                    headers: { ...formData.getHeaders() },
                    timeout: 5000 
                });

                if (flaskResponse && flaskResponse.data) break; 
            } catch (err) {
                lastError = err;
            }
        }

        // 2. Hybrid Logic: Evaluate Confidence
        const MIN_CONFIDENCE = 65; 
        let finalData = null;

        if (flaskResponse && flaskResponse.data?.prediction) {
            const prediction = flaskResponse.data.prediction;
            console.log(`[Hybrid AI] Local Match: ${prediction.Dish_Name} (${prediction.confidence_score?.toFixed(1)}%)`);

            if (prediction.confidence_score >= MIN_CONFIDENCE) {
                finalData = prediction;
            } else {
                console.log("[Hybrid AI] Low confidence, falling back to Gemini...");
            }
        }

        // 3. Fallback to Gemini if Local failed or was unsure
        if (!finalData) {
            console.log("[Hybrid AI] Querying Gemini Cloud...");
            const geminiData = await identifyFoodWithGemini(req.file.buffer, req.file.mimetype);
            if (geminiData) {
                finalData = {
                    ...geminiData,
                    isGemini: true,
                    confidence_score: 100 // Gemini as ground truth fallback
                };
            }
        }

        if (finalData) {
            return res.status(200).json({
                success: true,
                data: finalData
            });
        }

        throw lastError || new Error("All AI targets unreachable");

    } catch (error) {
        console.error("Hybrid AI Error:", error);
        res.status(200).json({ 
            success: false,
            message: error.message || "AI Service Error",
            error: error.stack
        });
    }
});
// ---------------------------------------------------------
// 🔥 Integration End
// ---------------------------------------------------------

// ✅ Other API routes
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/order", orderRouter)
app.use("/api/diet", dietRouter)
app.use("/api/ai", aiRouter)
app.use("/api/cart", cartRouter)

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("NutriTomato API Working")
})

// ✅ Server Listen (Only for Local Development)
app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})

// ✅ Global Error Handler (FOR DEBUGGING VERCEL 500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Server Crash!", error: err.message });
});

// ✅ Export for Vercel Serverless
export default app;