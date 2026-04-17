import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";
import 'dotenv/config';

const checkCategories = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const foods = await foodModel.find({});
    console.log("Total foods:", foods.length);
    foods.forEach(food => {
        console.log(`- ${food.name}: ${food.category}`);
    });
    process.exit();
}

checkCategories();
