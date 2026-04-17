import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Using gemini-flash-latest as verified working model
const MODEL_NAME = "gemini-flash-latest";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const limiter = new Bottleneck({ ... }); // Removed for debugging

// Simple in-memory cache
const responseCache = new Map();

const chatWithAI = async (req, res) => {
    let imagePath = null;
    console.log(`[AI Debug] Handling request using model: ${MODEL_NAME}`);

    try {
        const { prompt, history } = req.body;

        // 1. Check Cache (Skip API if we already know the answer)
        // Create a simple key based on the last message
        const cacheKey = prompt ? prompt.trim().toLowerCase() : null;

        if (cacheKey && responseCache.has(cacheKey) && !req.file) {
            console.log("[AI Cache] Hit!");
            const cachedData = responseCache.get(cacheKey);
            // Fix: Destructure the cached object
            return res.json({
                success: true,
                message: cachedData.text,
                calories: cachedData.calories
            });
        }
        // ... (existing code)


        // ...

        if (!prompt && !req.file) {
            return res.json({
                success: false,
                message: "Please provide a message or an image."
            });
        }

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: "You are a professional, friendly, and expert AI Nutritionist. You help users plan their diet, gain, lose, or maintain weight, and provide nutrition advice.\n\nCritically, you can analyze images of food. When a user sends an image, identify the food, estimate the portion size accurately, and provide the calorie count AND MACRONUTRIENTS.\n\nFor Packaged Foods: If the user uploads an image of a wrapper, bottle, or label, ALWAYS try to read the specific calorie/macro information from the image text first. If it's a text query for a packaged item (e.g. 'Booster energy drink'), provide an estimate but explicitly state that brands vary significantly and advise checking the label.\n\nIMPORTANT: You must output JSON.\n\nJSON Schema:\n{\n  \"text\": \"Your detailed advice here...\",\n  \"calories\": \"Total calories (e.g., '500') or null\",\n  \"protein\": \"Total protein in grams (e.g., '30') or null\",\n  \"fats\": \"Total fats in grams (e.g., '10') or null\",\n  \"carbs\": \"Total carbs in grams (e.g., '50') or null\",\n  \"confidence\": \"High/Medium/Low\",\n  \"confidenceScore\": \"Percentage (e.g. 85)\" \n}",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Normalize History
        let chatHistory = [];
        if (history) {
            try {
                const parsed = JSON.parse(history);
                // Convert frontend format (role: 'ai/user', content: 'text') 
                // to Gemini format (role: 'model/user', parts: [{text}])
                chatHistory = parsed.map(msg => ({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text || msg.content || "" }]
                }));
            } catch (e) {
                console.warn("History parse error, ignoring:", e.message);
                chatHistory = [];
            }
        }

        // Construct Current Message Parts
        const parts = [];
        if (prompt) {
            // Append explicit instruction to user prompt to force compliance
            parts.push({ text: prompt + " \n[System: Return JSON with {text, calories, protein, fats, carbs}]" });
        }

        if (req.file) {
            imagePath = req.file.path;
            const imageData = fs.readFileSync(imagePath);
            parts.push({
                inlineData: {
                    data: imageData.toString("base64"),
                    mimeType: req.file.mimetype
                }
            });
        }

        // Smart Retry Logic
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        async function safeGenerate(model, payload) {
            for (let i = 0; i < 3; i++) {
                try {
                    return await model.generateContent(payload);
                } catch (e) {
                    // If not a 429 error, throw immediately
                    if (!e.message.includes("429")) throw e;
                    console.log(`[AI Retry] Hit 429, waiting ${2000 * (i.toString() + 1)}ms...`);
                    await sleep(2000 * (i + 1)); // exponential backoff
                }
            }
            throw new Error("429 Rate limit exceeded after retries");
        }

        const result = await safeGenerate(model, {
            contents: [
                ...chatHistory,
                { role: "user", parts }
            ]
        });

        const rawText = result.response.text();
        let finalResponse = {};

        try {
            // Attempt to parse JSON
            // Clean up potential markdown blocks if the model ignores instructions
            const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            finalResponse = JSON.parse(cleanedText);

            // Validate that we actually have a text field
            if (!finalResponse.text) {
                // Try to find any string field that looks like the answer, or stringify the whole thing
                const values = Object.values(finalResponse);
                const textCandidate = values.find(v => typeof v === 'string' && v.length > 20);
                finalResponse.text = textCandidate || JSON.stringify(finalResponse);
            }

        } catch (e) {
            console.warn("AI did not return JSON. Fallback to text.", e);
            finalResponse = {
                text: rawText,
                calories: null
            };
        }

        // 2. Save to Cache (if text only and successful parse)
        if (prompt && !req.file && finalResponse.text) {
            const cacheKey = prompt.trim().toLowerCase();
            responseCache.set(cacheKey, finalResponse);

            // Limit cache size to prevent memory leaks
            if (responseCache.size > 100) {
                const firstKey = responseCache.keys().next().value;
                responseCache.delete(firstKey);
            }
        }

        res.json({
            success: true,
            message: finalResponse.text,
            calories: finalResponse.calories,
            protein: finalResponse.protein,
            fats: finalResponse.fats,
            carbs: finalResponse.carbs,
            confidence: finalResponse.confidence,
            confidenceScore: finalResponse.confidenceScore
        });

    } catch (error) {
        console.error("Full AI error:", error); // log full error

        let userMessage = "AI service is temporarily unavailable.";

        if (error.message.includes("429")) {
            userMessage = "Too many requests. Please wait 1 minute.";
        } else if (error.message.includes("400") && error.message.includes("expired")) {
            userMessage = "API Key Error: The key appears to be expired.";
        } else if (error.message.includes("API key not valid")) {
            userMessage = "API Key Error: Invalid key.";
        }

        res.json({
            success: false,
            message: userMessage,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });

    } finally {
        if (imagePath && fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (e) { /* ignore unlink error */ }
        }
    }
};

export { chatWithAI };
