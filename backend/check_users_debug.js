import mongoose from "mongoose";
import userModel from "./models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        const users = await userModel.find({});
        console.log("\nRegistered Users:");
        users.forEach((user) => {
            console.log(`- Name: ${user.name}, Email: ${user.email}`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
};

listUsers();
