import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Robust .env loading
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
// fallback if running from root
if (!process.env.GEMINI_API_KEY) {
    dotenv.config();
}

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing from .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function test() {
    try {
        console.log("Testing systemInstruction support...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: "Hello, are you working?" }] }],
        });
        const response = await result.response;
        console.log("✅ AI Response:", response.text());
    } catch (error) {
        console.error("❌ Test Failed:", error.message);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

test();
