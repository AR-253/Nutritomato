import dietModel from "../models/dietModel.js";
import dailyLogModel from "../models/dailyLogModel.js";
import orderModel from "../models/orderModel.js";

// Save diet plan
const saveDietPlan = async (req, res) => {
    try {
        const { userId, userInfo, plan } = req.body;

        // Check if plan already exists for user, update it
        let existingPlan = await dietModel.findOne({ userId });
        if (existingPlan) {
            await dietModel.findByIdAndUpdate(existingPlan._id, { userInfo, plan, date: Date.now() });
            res.json({ success: true, message: "Diet Plan Updated" });
        } else {
            const newDiet = new dietModel({
                userId,
                userInfo,
                plan
            });
            await newDiet.save();
            res.json({ success: true, message: "Diet Plan Saved" });
        }
    } catch (error) {
        console.log("Error in saveDietPlan:", error);
        res.json({ success: false, message: error.message });
    }
}

// Get diet plan
const getDietPlan = async (req, res) => {
    try {
        const { userId } = req.body;
        const dietPlan = await dietModel.findOne({ userId });
        if (dietPlan) {
            res.json({ success: true, data: dietPlan });
        } else {
            res.json({ success: false, message: "No Plan Found" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Log consumed calories
const logCalories = async (req, res) => {
    try {
        console.log("logCalories called");
        console.log("Request Body:", req.body);

        const { userId, calories, protein, fats, carbs, date, foodName, type, image } = req.body; // macros added

        if (!userId) {
            console.log("Missing userId");
            return res.json({ success: false, message: "User ID missing" });
        }

        // Get today's date in YYYY-MM-DD format if not provided
        const today = date || new Date().toISOString().split('T')[0];
        console.log("Logging for date:", today, "Calories:", calories);
        console.log("Macros received - Protein:", protein, "Fats:", fats, "Carbs:", carbs);

        // Find log for today, or create new
        let log = await dailyLogModel.findOne({ userId, date: today });

        if (!log) {
            log = new dailyLogModel({
                userId,
                date: today,
                consumedCalories: 0,
                consumedProtein: 0,
                consumedFats: 0,
                consumedCarbs: 0,
                logs: []
            });
        }

        let logName = foodName || "Calorie Log";
        let logType = type || 'manual';

        // Handle Order Logic (If orderId is provided)
        if (req.body.orderId) {
            const order = await orderModel.findById(req.body.orderId);
            if (order) {
                // If previously logged, subtract the old amount first
                if (order.loggedCalories) {
                    log.consumedCalories -= (order.loggedCalories || 0);
                    // Also subtract old macros if they exist
                    log.consumedProtein -= (order.loggedProtein || 0);
                    log.consumedFats -= (order.loggedFats || 0);
                    log.consumedCarbs -= (order.loggedCarbs || 0);
                }

                // Update order with new amount
                order.loggedCalories = calories;
                order.loggedProtein = protein || 0;
                order.loggedFats = fats || 0;
                order.loggedCarbs = carbs || 0;
                order.isLogged = true;
                await order.save();

                // Set more descriptive name and type for order logs
                if (!foodName) {
                    // specific items or just generic
                    logName = `Order Consumption`;
                }
                logType = 'order';
            }
        }

        // Add new calories & macros
        // Ensure existing fields are treated as 0 if they don't exist (migrations)
        log.consumedCalories = (log.consumedCalories || 0) + Number(calories || 0);
        log.consumedProtein = (log.consumedProtein || 0) + Number(protein || 0);
        log.consumedFats = (log.consumedFats || 0) + Number(fats || 0);
        log.consumedCarbs = (log.consumedCarbs || 0) + Number(carbs || 0);

        // Prevent negative values
        if (log.consumedCalories < 0) log.consumedCalories = 0;
        if (log.consumedProtein < 0) log.consumedProtein = 0;
        if (log.consumedFats < 0) log.consumedFats = 0;
        if (log.consumedCarbs < 0) log.consumedCarbs = 0;

        // Add detailed log entry
        log.logs.push({
            name: logName,
            calories: Number(calories || 0),
            protein: Number(protein || 0),
            fats: Number(fats || 0),
            carbs: Number(carbs || 0),
            type: logType,
            image: image || "",
            timestamp: new Date()
        });

        await log.save();

        console.log("Calories logged successfully");
        res.json({ success: true, message: `Logged ${calories} kcal`, data: log });

    } catch (error) {
        console.log("Error logging calories:", error);
        res.json({ success: false, message: "Error logging calories: " + error.message });
    }
}

// Get diet history (logs)
const getDietHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const logs = await dailyLogModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, data: logs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching history" });
    }
}

export { saveDietPlan, getDietPlan, logCalories, getDietHistory };
