import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";
import 'dotenv/config';

const fixCategories = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const updates = [
        { name: "Fruit Ice Cream", category: "Desserts" }, // Was Salad
        { name: "Veg Rolls", category: "Rolls" },          // Was Salad
        { name: "Veg Noodles", category: "Noodles" }       // Was Salad
    ];

    for (const update of updates) {
        const res = await foodModel.updateOne({ name: update.name }, { category: update.category });
        if (res.modifiedCount > 0) {
            console.log(`✅ Updated ${update.name} to ${update.category}`);
        } else {
            console.log(`⚠️ Could not update ${update.name} (maybe not found or already correct)`);
        }
    }

    process.exit();
}

fixCategories();
