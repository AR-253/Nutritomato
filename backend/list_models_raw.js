
import dotenv from "dotenv";
dotenv.config();

async function list() {
    try {
        const key = process.env.GEMINI_API_KEY;
        console.log(`Checking key: ${key.substring(0, 5)}...`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        const response = await fetch(url);
        const data = await response.json();

        console.log("HTTP Status:", response.status);

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log("Error Response:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Script Error:", e.message);
    }
}

list();
