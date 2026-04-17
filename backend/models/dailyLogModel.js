import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, required: true }, // Store as YYYY-MM-DD for easy querying
    consumedCalories: { type: Number, default: 0 },
    consumedProtein: { type: Number, default: 0 },
    consumedFats: { type: Number, default: 0 },
    consumedCarbs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    logs: [
        {
            name: { type: String, required: true },
            calories: { type: Number, required: true },
            protein: { type: Number, default: 0 },
            fats: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 },
            portion: { type: String }, // e.g., "1 slice", "200g"
            type: { type: String, enum: ['manual', 'ai', 'order'], default: 'manual' },
            image: { type: String }, // Optional: separate URL or base64 if needed, usually just analyzing
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const dailyLogModel = mongoose.models.dailyLog || mongoose.model("dailyLog", dailyLogSchema);

export default dailyLogModel;
