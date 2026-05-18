import dietModel from "../models/dietModel.js";
import dailyLogModel from "../models/dailyLogModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Reset Today's Log
const resetDailyLog = async (req, res) => {
    try {
        const { userId, date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // Find the log to see what orders need resetting
        const log = await dailyLogModel.findOne({ userId, date: targetDate });
        if (log) {
            // Find all unique orderIds in this log
            const orderIds = log.logs.filter(l => l.orderId).map(l => l.orderId);
            if (orderIds.length > 0) {
                await orderModel.updateMany(
                    { _id: { $in: orderIds } },
                    { $set: { isLogged: false, loggedCalories: 0, loggedProtein: 0, loggedFats: 0, loggedCarbs: 0 } }
                );
            }
        }

        await dailyLogModel.findOneAndDelete({ userId, date: targetDate });
        res.json({ success: true, message: "Log has been reset and orders cleared." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error resetting log" });
    }
}

// Save diet plan
const saveDietPlan = async (req, res) => {
    try {
        const { userId, userInfo, plan, mealPlan } = req.body;

        // Check if plan already exists for user, update it
        let existingPlan = await dietModel.findOne({ userId });
        if (existingPlan) {
            await dietModel.findByIdAndUpdate(existingPlan._id, { userInfo, plan, mealPlan: mealPlan || existingPlan.mealPlan, date: Date.now() });
            res.json({ success: true, message: "Diet Plan Updated" });
        } else {
            const newDiet = new dietModel({
                userId,
                userInfo,
                plan,
                mealPlan: mealPlan || []
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
        let { userId, calories, protein, fats, carbs, date, foodName, type, image, mealType, orderId } = req.body; 

        if (!userId) {
            return res.json({ success: false, message: "User ID missing" });
        }

        // NORMALIZE DATE to YYYY-MM-DD
        let today = new Date().toISOString().split('T')[0];
        if (date) {
            // If date is an ISO string or Date object, extract just the YYYY-MM-DD part
            today = new Date(date).toISOString().split('T')[0];
        }
        
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
        
        let currentMeal = mealType;
        if (!currentMeal) {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) currentMeal = 'Breakfast';
            else if (hour >= 11 && hour < 16) currentMeal = 'Lunch';
            else if (hour >= 16 && hour < 20) currentMeal = 'Dinner';
            else currentMeal = 'Snack';
        }

        // HANDLE ORDER UPDATES
        if (orderId) {
            const order = await orderModel.findById(orderId);
            if (order) {
                // REMOVE the previous entry for this order (Logical Fix: use !== instead of keeping it)
                log.logs = log.logs.filter(l => 
                    !( (l.orderId && l.orderId.toString() === orderId.toString()) || 
                       (l.name && l.name.includes(orderId.toString().slice(-4))) )
                );
                
                // Update order model status
                order.loggedCalories = Number(calories);
                order.loggedProtein = Number(protein || 0);
                order.loggedFats = Number(fats || 0);
                order.loggedCarbs = Number(carbs || 0);
                order.isLogged = true;
                await order.save();

                logName = foodName || `Order Consumption`;
                logType = 'order';
            }
        }

        // Add new log entry
        log.logs.push({
            name: logName,
            calories: Number(calories || 0),
            protein: Number(protein || 0),
            fats: Number(fats || 0),
            carbs: Number(carbs || 0),
            type: logType,
            orderId: orderId || null,
            mealType: currentMeal,
            image: image || "",
            timestamp: new Date()
        });

        // RE-CALCULATE TOTALS (The safest way to avoid glitches)
        let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
        log.logs.forEach(item => {
            totalCals += Number(item.calories || 0);
            totalP += Number(item.protein || 0);
            totalC += Number(item.carbs || 0);
            totalF += Number(item.fats || 0);
        });

        log.consumedCalories = totalCals;
        log.consumedProtein = totalP;
        log.consumedCarbs = totalC;
        log.consumedFats = totalF;

        await log.save();
        res.json({ success: true, message: `Logged ${calories} kcal`, data: log });
    } catch (error) {
        console.log("Error logging calories:", error);
        res.json({ success: false, message: "Error logging calories: " + error.message });
    }
}

// Get diet history for user
const getDietHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const logs = await dailyLogModel.find({ userId });

        // Sanity Check: Ensure consumed totals match the sum of logs
        for (let log of logs) {
            let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
            log.logs.forEach(item => {
                totalCals += (item.calories || 0);
                totalP += (item.protein || 0);
                totalC += (item.carbs || 0);
                totalF += (item.fats || 0);
            });

            if (log.consumedCalories !== totalCals || log.consumedProtein !== totalP) {
                log.consumedCalories = totalCals;
                log.consumedProtein = totalP;
                log.consumedCarbs = totalC;
                log.consumedFats = totalF;
                await log.save();
            }
        }

        res.json({ success: true, data: logs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching history" });
    }
}

// Log Water Intake
const logWater = async (req, res) => {
    try {
        const { userId, amount, date } = req.body; 
        const today = date || new Date().toISOString().split('T')[0];
        let log = await dailyLogModel.findOne({ userId, date: today });
        if (!log) {
            log = new dailyLogModel({
                userId,
                date: today,
                consumedCalories: 0,
                consumedProtein: 0,
                consumedFats: 0,
                consumedCarbs: 0,
                waterIntake: 0,
                logs: []
            });
        }
        log.waterIntake = (log.waterIntake || 0) + Number(amount);
        if (log.waterIntake < 0) log.waterIntake = 0;
        await log.save();
        res.json({ success: true, message: "Water intake updated", waterIntake: log.waterIntake });
    } catch (error) {
        console.log("Error logging water:", error);
        res.json({ success: false, message: "Error logging water" });
    }
}

// Get Weekly Report
const getWeeklyReport = async (req, res) => {
    try {
        const { userId } = req.body;
        const dietPlan = await dietModel.findOne({ userId });
        if (!dietPlan) {
            return res.json({ success: false, message: "No diet plan found to generate report." });
        }
        const targetCalories = dietPlan.plan.calories;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateStr = sevenDaysAgo.toISOString().split('T')[0];
        const logs = await dailyLogModel.find({ 
            userId, 
            date: { $gte: dateStr } 
        }).sort({ date: 1 });

        const reportData = [];
        let successfulDays = 0;
        let totalConsumed = 0;

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            // Use local date parts to build YYYY-MM-DD string to avoid timezone shifts
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dayStr = `${year}-${month}-${day}`;
            const dayLog = logs.find(l => l.date === dayStr);
            const consumed = dayLog ? dayLog.consumedCalories : 0;
            const foods = dayLog ? dayLog.logs.map(f => f.name).join(", ") : "No food logged";
            const isSuccess = Math.abs(consumed - targetCalories) <= (targetCalories * 0.15);
            if (isSuccess && consumed > 0) successfulDays++;
            totalConsumed += consumed;
            reportData.push({
                day: d.toLocaleDateString('en-US', { weekday: 'long' }),
                date: dayStr,
                consumed,
                target: targetCalories,
                foods: foods,
                status: consumed === 0 ? 'No Data' : (isSuccess ? 'On Track' : (consumed > targetCalories ? 'Over' : 'Under'))
            });
        }

        const averageIntake = Math.round(totalConsumed / 7);
        const consistencyScore = Math.round((successfulDays / 7) * 100);

        res.json({ 
            success: true, 
            data: {
                reportData,
                summary: { averageIntake, targetCalories, successfulDays, consistencyScore, totalConsumed }
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error generating weekly report" });
    }
}

// Get Custom Range Report
const getCustomReport = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.body;
        if (!startDate || !endDate) {
            return res.json({ success: false, message: "Please provide start and end dates." });
        }

        // 1. Get current plan for targets
        const dietPlan = await dietModel.findOne({ userId });
        const targets = dietPlan ? dietPlan.plan : { calories: 2000, protein: 150, carbs: 250, fats: 70 };

        const logs = await dailyLogModel.find({ 
            userId, 
            date: { $gte: startDate, $lte: endDate } 
        }).sort({ date: 1 });

        let totalCals = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let loggedDays = logs.length;
        let successfulDays = 0;

        logs.forEach(log => {
            totalCals += (log.consumedCalories || 0);
            totalProtein += (log.consumedProtein || 0);
            totalCarbs += (log.consumedCarbs || 0);
            totalFats += (log.consumedFats || 0);

            // A day is successful if within 15% of calorie target
            const isSuccess = Math.abs((log.consumedCalories || 0) - targets.calories) <= (targets.calories * 0.15);
            if (isSuccess && log.consumedCalories > 0) successfulDays++;
        });

        const averages = {
            calories: loggedDays > 0 ? Math.round(totalCals / loggedDays) : 0,
            protein: loggedDays > 0 ? Math.round(totalProtein / loggedDays) : 0,
            carbs: loggedDays > 0 ? Math.round(totalCarbs / loggedDays) : 0,
            fats: loggedDays > 0 ? Math.round(totalFats / loggedDays) : 0
        };

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const totalDaysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Fill in missing days with zeroed logs
        const allLogs = [];
        for (let i = 0; i < totalDaysInRange; i++) {
            const current = new Date(start);
            current.setDate(current.getDate() + i);
            const dateStr = current.toISOString().split('T')[0];
            
            const existingLog = logs.find(l => l.date === dateStr);
            if (existingLog) {
                allLogs.push(existingLog);
            } else {
                allLogs.push({
                    date: dateStr,
                    consumedCalories: 0,
                    consumedProtein: 0,
                    consumedFats: 0,
                    consumedCarbs: 0,
                    waterIntake: 0,
                    logs: []
                });
            }
        }

        const totalTargets = {
            calories: targets.calories * totalDaysInRange,
            protein: targets.protein * totalDaysInRange,
            carbs: targets.carbs * totalDaysInRange,
            fats: targets.fats * totalDaysInRange
        };

        res.json({ 
            success: true, 
            data: {
                logs: allLogs,
                targets,
                daysInRange: totalDaysInRange,
                summary: { 
                    totalCals, totalProtein, totalCarbs, totalFats, 
                    averages, totalTargets, loggedDays, successfulDays 
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error generating custom report" });
    }
}

export { saveDietPlan, getDietPlan, logCalories, getDietHistory, logWater, getWeeklyReport, getCustomReport, resetDailyLog };
