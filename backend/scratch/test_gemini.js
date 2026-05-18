import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Note: The SDK doesn't have a direct listModels method on the genAI object usually, 
    // it's often done via the base API or just trial and error in scripts.
    // But we can try a simple generation with a known model to verify connectivity.
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-flash-latest:", result.response.text());
  } catch (e) {
    console.error("Failed with gemini-flash-latest:", e.message);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-pro:", result.response.text());
    } catch (e2) {
        console.error("Failed with gemini-pro:", e2.message);
    }
  }
}

listModels();
