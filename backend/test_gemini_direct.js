
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        console.log("Testing Gemini API with key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

        // Using standard gemini-pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        console.log("Generating with gemini-pro...");
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            // console.error("Full Details:", JSON.stringify(e.response, null, 2));
        }
    }
}

run();
