import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, required: true }, // Store as YYYY-MM-DD for easy querying
    consumedCalories: { type: Number, default: 0 },
    consumedProtein: { type: Number, default: 0 },
    consumedFats: { type: Number, default: 0 },
    consumedCarbs: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 }, // New field for water tracking
    timestamp: { type: Date, default: Date.now },
    logs: [
        {
            name: { type: String, required: true },
            calories: { type: Number, required: true },
            protein: { type: Number, default: 0 },
            fats: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 },
            portion: { type: String }, 
            mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'General'], default: 'General' }, // New field
            type: { type: String, enum: ['manual', 'ai', 'order'], default: 'manual' },
            orderId: { type: String }, // To link with order updates
            image: { type: String }, 
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const dailyLogModel = mongoose.models.dailyLog || mongoose.model("dailyLog", dailyLogSchema);

export default dailyLogModel;
