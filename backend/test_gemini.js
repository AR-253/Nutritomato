import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function testGemini() {
    try {
        console.log("Testing Gemini API with Key:", process.env.GEMINI_API_KEY);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error testing Gemini:", error);
    }
}

testGemini();
