import mongoose from "mongoose";


export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected Successfully");
    } catch (error) {
        console.error("DB connection error:", error.message);
        // Do not use process.exit(1) in serverless environments
    }
}