import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
// Access the API via a simpler method to list models if possible, 
// using the GoogleAIFileManager or just raw fetch if SDK doesn't expose it easily.
// Actually, the SDK has a way.

// Since the SDK might not expose listModels directly on the main class easily (it's usually on a Manager), 
// I'll try a raw fetch to the API endpoint which is universal.
async function listModels() {
    console.log("Listing models via fetch...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods.join(", ")})`);
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
