import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const runWithRetry = async (fn, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}...`);
            return await fn();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) throw error;
            if (error.message.includes("503") || error.message.includes("429")) {
                console.log(`Waiting ${delay * (i + 1)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            } else {
                throw error;
            }
        }
    }
};

async function runTest() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await runWithRetry(() => model.generateContent("Hello friend!"));
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (error) {
        console.error("Test failed after retries:", error);
    }
}

runTest();
