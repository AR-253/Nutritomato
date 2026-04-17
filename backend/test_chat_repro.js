import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testChatWithSystemInstruction() {
    console.log("Testing Chat with System Instruction...");
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are a helpful, harmless, and honest AI assistant. You can answer questions on any topic. You are also an expert in nutrition and food analysis."
        });

        const chat = model.startChat({
            history: [] // simulating empty history or valid history
        });

        console.log("Chat started. Sending message...");
        const result = await chat.sendMessage("calerious in banaana");
        const response = await result.response;
        console.log("Response:", response.text());

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testChatWithSystemInstruction();
