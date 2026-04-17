import mongoose from "mongoose";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import foodModel from "./models/foodModel.js";

const verifySystem = async () => {
    console.log("--- Starting System Verification ---");

    // 1. Verify Database
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const count = await foodModel.countDocuments({});
        console.log(`🍎 Food Items Count: ${count}`);

        if (count === 0) {
            console.warn("⚠️  WARNING: Food collection is empty! Products will not show.");
        } else {
            const items = await foodModel.find({}).limit(1);
            console.log("First item sample:", items[0]);
        }
    } catch (error) {
        console.error("❌ MongoDB Error:", error.message);
    }

    // 2. Verify Gemini API - List Models
    try {
        console.log("\nTesting Gemini API...");
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in .env");
        }

        const key = process.env.GEMINI_API_KEY;
        // Use Node's built-in fetch (Node 18+) or install node-fetch. Assuming Node 18+ used by user.
        // If fetch fails, we will know.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        console.log("Fetching models list via fetch...");
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => console.log(` - ${m.name}`));

            // Try gemini-1.5-flash since we want that
            const targetModel = "models/gemini-1.5-flash";
            const validModel = data.models.find(m => m.name === targetModel);

            if (validModel) {
                console.log(`\nTesting with model: ${validModel.name}`);
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const modelName = validModel.name.replace('models/', '');
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log("✅ AI Response:", (await result.response).text());
            } else {
                console.log(`❌ Model ${targetModel} not found in list.`);
                // Fallback test with first available
                const fallback = data.models.find(m => m.name.includes('gemini'));
                if (fallback) {
                    console.log(`Fallback testing with ${fallback.name}`);
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const modelName = fallback.name.replace('models/', '');
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent("Hello");
                    console.log("✅ AI Response (Fallback):", (await result.response).text());
                }
            }
        } else {
            console.error("❌ Failed to list models:", data);
        }

    } catch (error) {
        console.error("❌ Gemini Verification Error:", error.message);
    }

    process.exit();
};

verifySystem();
