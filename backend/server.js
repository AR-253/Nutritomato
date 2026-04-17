import 'dotenv/config'
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

const app = express()
const port = 4000

// ✅ Multer Setup (AI Image handling in memory)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Middleware
app.use(express.json())
app.use(cors({
  origin: ["https://nutritomato-hdwl.vercel.app", "http://localhost:5173", "http://localhost:3000"],
  credentials: true
}))

// Custom Logger (Disabled file logging for Vercel compatibility)
app.use((req, res, next) => {
    const logEntry = `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`;
    console.log(logEntry);
    next();
});

// ✅ Serve uploaded images publicly
app.use("/uploads", express.static("uploads"))

// ✅ Connect DB
console.log("Attempting to connect to DB...");
connectDB();

// ---------------------------------------------------------
// 🔥 AI PREDICTION DIRECT ROUTE (Integration Start)
// ---------------------------------------------------------
app.post("/api/food/predict-nutrition", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        console.log("Forwarding image to AI Service (Flask)...");

        // Prepare form data for Flask
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Requesting Flask Server (Port 5000)
        const flaskResponse = await axios.post('http://127.0.0.1:5000/predict', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // Returning the nutrition data to React
        res.status(200).json({
            success: true,
            data: flaskResponse.data.prediction
        });

    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({
            success: false,
            message: "AI Server is not responding. Make sure Flask is running on port 5000.",
            error: error.message
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

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("NutriTomato API Working")
})

// ✅ Server Listen (Only for Local Development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
  })
}

// ✅ Export for Vercel Serverless
export default app;