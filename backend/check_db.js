
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: "./.env" });

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

const checkDB = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const count = await foodModel.countDocuments({});
        console.log("Total food items in DB:", count);
        const samples = await foodModel.find({}).limit(5);
        console.log("Sample items:", JSON.stringify(samples, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error checking DB:", error);
        process.exit(1);
    }
};

checkDB();
