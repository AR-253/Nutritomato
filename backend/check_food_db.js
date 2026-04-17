import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";
import "dotenv/config";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    } catch (error) {
        console.log("DB Connection Error", error);
    }
}

const checkFood = async () => {
    await connectDB();
    const foods = await foodModel.find({});
    console.log("Total Food Items:", foods.length);
    foods.forEach(food => {
        console.log(`- ${food.name}: ${food.image} (${food.category})`);
        console.log(`  Cal: ${food.calories}, P: ${food.protein}, C: ${food.carbs}, F: ${food.fats}`);
    });
    // Wait for console log to flush
    setTimeout(() => {
        mongoose.disconnect();
    }, 1000);
}

checkFood();
