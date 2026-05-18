import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const MODEL_NAME = "gemini-flash-latest";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeDish = async (req, res) => {
    try {
        const { name, description, weight } = req.body;

        if (!name || !weight) {
            return res.json({ success: false, message: "Dish name and weight are required" });
        }

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: `You are an expert AI Nutritionist. Analyze the dish based STRICTLY on the portion size/weight provided by the user. Do NOT suggest a different weight.
            
            Calculate all ingredients and macros FOR EXACTLY the provided weight (${weight}).
            
            Return ONLY a JSON object:
            {
                "ingredients": [
                    {"name": "Ingredient Name", "quantity": "Portion (relative to total)", "calories": 120}
                ],
                "totalCalories": 650,
                "totalProtein": 35,
                "totalCarbs": 70,
                "totalFats": 25,
                "totalWeight": "${weight}"
            }`,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Analyze this dish: Name: ${name}, Weight: ${weight}, Description: ${description || 'Standard preparation'}. 
        Provide ingredients and total nutrition for exactly ${weight}. Ensure math is correct (P*4 + C*4 + F*9).`;

        const result = await model.generateContent(prompt);
        const response = JSON.parse(result.response.text());

        res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.json({ success: false, message: "AI failed to analyze dish. Please add manually." });
    }
};

export { analyzeDish };
