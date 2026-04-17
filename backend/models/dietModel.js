import mongoose from "mongoose";

const dietSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userInfo: {
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        weight: { type: Number, required: true },
        height: { type: Number, required: true },
        activity: { type: String, required: true },
        goal: { type: String, required: true }
    },
    plan: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fats: { type: Number, required: true }
    },
    date: { type: Date, default: Date.now() }
})

const dietModel = mongoose.models.diet || mongoose.model("diet", dietSchema);

export default dietModel;
