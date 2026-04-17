import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const modelsToTest = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.0-flash-exp"
];

const testModels = async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log("Testing models...");

    for (const modelName of modelsToTest) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName} responded:`, response.text().slice(0, 50));
            // If success, we found a candidate!
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log("Error Name:", error.name);
            console.log("Error Message:", error.message);
            if (error.response) {
                console.log("Error Response Status:", error.response.status);
                console.log("Error Response Body:", await error.response.text());
            }
        }
    }
};

testModels();
