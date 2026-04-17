import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  cartData: {
    type: Object,
    default: {},
  },

  date: {
    type: Date,
    default: Date.now,
  },

  // Fitness Profile
  age: { type: Number },
  gender: { type: String, default: "Male" },
  weight: { type: Number }, // kg
  height: { type: Number }, // cm
  activity: { type: String, default: "Sedentary" },
  goal: { type: String, default: "Maintain" },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
