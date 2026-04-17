import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("Listing models via fetch...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("\n--- Standard Models ---");
            data.models.forEach(m => {
                const name = m.name.replace("models/", "");
                if (name.includes("gemini")) {
                    console.log(name);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
