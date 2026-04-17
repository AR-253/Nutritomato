import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        console.log(`Success with ${modelName}:`, response.text());
    } catch (error) {
        console.error(`Error with ${modelName}:`, error.message);
    }
}

async function runTests() {
    await testModel("gemini-1.5-flash"); // Standard stable
    await testModel("gemini-1.5-pro");   // Standard stable pro
}

runTests();
