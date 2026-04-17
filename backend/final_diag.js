import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

// Manually parse .env to be 100% sure what's on disk
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const key = envConfig.GEMINI_API_KEY;

console.log("--- DIAGNOSTIC USE ONLY ---");
console.log(`Loaded Key from .env: ${key ? key.substring(0, 10) + "..." : "UNDEFINED"}`);
// Expected new key starts with AIzaSyAf...

const run = async () => {
    const genAI = new GoogleGenerativeAI(key);
    // Try the Lite model
    console.log("Testing Model: gemini-flash-lite-latest");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
        const result = await model.generateContent("Test");
        console.log("✅ Success! Response:", result.response.text());
    } catch (e) {
        console.log("❌ Error:", e.message);
        if (e.message.includes("429")) {
            console.log(">>> CONFIRMED: This API Key is also rate limited.");
        }
    }
}
run();
