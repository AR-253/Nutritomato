import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testGeneralKnowledge() {
    console.log("Testing General Knowledge...");
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are a helpful, harmless, and honest AI assistant. You can answer questions on any topic. You are also an expert in nutrition and food analysis."
        });

        const result = await model.generateContent("What is the capital of France?");
        const response = await result.response;
        console.log("Response:", response.text());

        if (response.text().includes("Paris")) {
            console.log("SUCCESS: Answered general question correctly.");
        } else {
            console.log("WARNING: Unexpected response.");
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testGeneralKnowledge();
