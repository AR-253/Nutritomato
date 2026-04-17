
import axios from 'axios';

const API_URL = "http://localhost:4000/api/ai/chat";

async function testNutritionistPersona() {
    console.log("Testing AI Nutritionist Persona...");
    try {
        const response = await axios.post(API_URL, {
            prompt: "Who show I consult for diet advice?" // Indirect question to see if it identifies itself
        });

        if (response.data.success) {
            console.log("\n✅ AI Response:", response.data.message);
            if (response.data.message.toLowerCase().includes("nutritionist")) {
                console.log("✅ Persona Verified: Identified as Nutritionist.");
            } else {
                console.log("⚠️ Persona Check: Did not explicitly say 'Nutritionist' but responded.");
            }
        } else {
            console.log("❌ API Error:", response.data.message);
        }
    } catch (error) {
        console.error("❌ Request Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
}

async function testImageCapability() {
    // This requires a file upload, which is harder to script simply with axios without form-data lib setup for files
    // Skipping for now, focusing on persona text check.
    console.log("Skipping image test in simple script.");
}

testNutritionistPersona();
