import { GoogleGenerativeAI } from "@google/generative-ai";
// Use global process.env from server.js

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Identify food from an image buffer using Gemini Pro Vision (flash)
 * @param {Buffer} imageBuffer 
 * @param {string} mimeType 
 */
export const identifyFoodWithGemini = async (imageBuffer, mimeType) => {
    try {
        console.log("[Gemini Helper] Initializing with model: gemini-flash-latest");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = "Identify the food in this image. Return ONLY a JSON object with: {Dish_Name, Calories, Protein, Carbs, Fats}. Use numbers for nutritional values.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        console.log("[Gemini Helper] Raw response:", text);
        
        // Clean and parse JSON
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        
        // Normalize keys to match local model (Dish_Name, Calories, etc.)
        return {
            Dish_Name: parsed.Dish_Name || parsed.dish_name || "Unknown Food",
            Calories: Number(parsed.Calories || parsed.calories || 0),
            Protein: Number(parsed.Protein || parsed.protein || 0),
            Carbs: Number(parsed.Carbs || parsed.carbs || 0),
            Fats: Number(parsed.Fats || parsed.fats || 0)
        };
    } catch (error) {
        console.error("[Gemini Helper] ERROR:", error.message);
        return null;
    }
};
