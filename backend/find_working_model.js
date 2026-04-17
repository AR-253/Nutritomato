
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const candidates = [
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro-latest"
];

async function test() {
    for (const name of candidates) {
        console.log(`Testing ${name}...`);
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS: ${name} works!`);
            return;
        } catch (e) {
            console.log(`FAILED ${name}: ${e.message.split('\n')[0]}`);
        }
    }
    console.log("ALL FAILED.");
}
test();
