import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
    console.log("1. Authenticating...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log("2. Connecting to model 'gemini-flash-lite-latest' (The one we just fixed)...");
    const model = genAI.getGenerativeModel({
        model: "gemini-flash-lite-latest",
        systemInstruction: "You are a helpful bot."
    });

    console.log("3. Sending 'Hello'...");
    try {
        const result = await model.generateContent("Hello!");
        console.log("4. RESPONSE RECEIVED: ", result.response.text());
        console.log("✅ SYSTEM IS 100% WORKING.");
    } catch (e) {
        console.log("❌ ERROR:", e.message);
    }
}
run();
