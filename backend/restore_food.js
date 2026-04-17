
// [restore_food.js]
import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";
import fs from "fs";
import "dotenv/config";

const food_list = [
    {
        name: "Greek salad",
        image_suffix: "food_1.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad",
        macros: { calories: 250, protein: 5, carbs: 15, fats: 18 }
    },
    {
        name: "Veg salad",
        image_suffix: "food_2.png",
        price: 18,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad",
        macros: { calories: 220, protein: 4, carbs: 12, fats: 16 }
    }, {
        name: "Clover Salad",
        image_suffix: "food_3.png",
        price: 16,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad",
        macros: { calories: 230, protein: 5, carbs: 14, fats: 17 }
    }, {
        name: "Chicken Salad",
        image_suffix: "food_4.png",
        price: 24,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad",
        macros: { calories: 350, protein: 25, carbs: 10, fats: 20 }
    }, {
        name: "Lasagna Rolls",
        image_suffix: "food_5.png",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls",
        macros: { calories: 400, protein: 15, carbs: 45, fats: 18 }
    }, {
        name: "Peri Peri Rolls",
        image_suffix: "food_6.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls",
        macros: { calories: 380, protein: 14, carbs: 42, fats: 16 }
    }, {
        name: "Chicken Rolls",
        image_suffix: "food_7.png",
        price: 20,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls",
        macros: { calories: 450, protein: 22, carbs: 40, fats: 20 }
    }, {
        name: "Veg Rolls",
        image_suffix: "food_8.png",
        price: 15,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls",
        macros: { calories: 350, protein: 10, carbs: 48, fats: 14 }
    }, {
        name: "Ripple Ice Cream",
        image_suffix: "food_9.png",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Desserts",
        macros: { calories: 300, protein: 4, carbs: 35, fats: 15 }
    }, {
        name: "Fruit Ice Cream",
        image_suffix: "food_10.png",
        price: 22,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Desserts",
        macros: { calories: 320, protein: 5, carbs: 38, fats: 14 }
    }, {
        name: "Jar Ice Cream",
        image_suffix: "food_11.png",
        price: 10,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Desserts",
        macros: { calories: 280, protein: 4, carbs: 32, fats: 12 }
    }, {
        name: "Vanilla Ice Cream",
        image_suffix: "food_12.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Desserts",
        macros: { calories: 250, protein: 3, carbs: 30, fats: 11 }
    },
    {
        name: "Chicken Sandwich",
        image_suffix: "food_13.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich",
        macros: { calories: 400, protein: 20, carbs: 35, fats: 18 }
    },
    {
        name: "Vegan Sandwich",
        image_suffix: "food_14.png",
        price: 18,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich",
        macros: { calories: 350, protein: 12, carbs: 40, fats: 14 }
    }, {
        name: "Grilled Sandwich",
        image_suffix: "food_15.png",
        price: 16,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich",
        macros: { calories: 380, protein: 18, carbs: 38, fats: 16 }
    }, {
        name: "Bread Sandwich",
        image_suffix: "food_16.png",
        price: 24,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich",
        macros: { calories: 320, protein: 10, carbs: 45, fats: 12 }
    }, {
        name: "Cup Cake",
        image_suffix: "food_17.png",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake",
        macros: { calories: 350, protein: 3, carbs: 45, fats: 18 }
    }, {
        name: "Vegan Cake",
        image_suffix: "food_18.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake",
        macros: { calories: 320, protein: 4, carbs: 40, fats: 15 }
    }, {
        name: "Butterscotch Cake",
        image_suffix: "food_19.png",
        price: 20,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake",
        macros: { calories: 400, protein: 5, carbs: 50, fats: 20 }
    }, {
        name: "Sliced Cake",
        image_suffix: "food_20.png",
        price: 15,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake",
        macros: { calories: 300, protein: 4, carbs: 35, fats: 16 }
    }, {
        name: "Garlic Mushroom ",
        image_suffix: "food_21.png",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg",
        macros: { calories: 150, protein: 8, carbs: 12, fats: 8 }
    }, {
        name: "Fried Cauliflower",
        image_suffix: "food_22.png",
        price: 22,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg",
        macros: { calories: 200, protein: 6, carbs: 18, fats: 12 }
    }, {
        name: "Mix Veg Pulao",
        image_suffix: "food_23.png",
        price: 10,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg",
        macros: { calories: 350, protein: 8, carbs: 60, fats: 10 }
    }, {
        name: "Rice Zucchini",
        image_suffix: "food_24.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg",
        macros: { calories: 220, protein: 5, carbs: 25, fats: 10 }
    },
    {
        name: "Cheese Pasta",
        image_suffix: "food_25.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta",
        macros: { calories: 450, protein: 12, carbs: 55, fats: 20 }
    },
    {
        name: "Tomato Pasta",
        image_suffix: "food_26.png",
        price: 18,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta",
        macros: { calories: 400, protein: 10, carbs: 60, fats: 14 }
    }, {
        name: "Creamy Pasta",
        image_suffix: "food_27.png",
        price: 16,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta",
        macros: { calories: 500, protein: 14, carbs: 50, fats: 25 }
    }, {
        name: "Chicken Pasta",
        image_suffix: "food_28.png",
        price: 24,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta",
        macros: { calories: 550, protein: 28, carbs: 50, fats: 22 }
    }, {
        name: "Buttter Noodles",
        image_suffix: "food_29.png",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles",
        macros: { calories: 420, protein: 8, carbs: 65, fats: 16 }
    }, {
        name: "Veg Noodles",
        image_suffix: "food_30.png",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles",
        macros: { calories: 400, protein: 10, carbs: 70, fats: 12 }
    }, {
        name: "Somen Noodles",
        image_suffix: "food_31.png",
        price: 20,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles",
        macros: { calories: 380, protein: 12, carbs: 60, fats: 10 }
    }, {
        name: "Cooked Noodles",
        image_suffix: "food_32.png",
        price: 15,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles",
        macros: { calories: 450, protein: 14, carbs: 68, fats: 15 }
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    } catch (error) {
        console.log("DB Connection Error", error);
        process.exit(1);
    }
}

const restoreFood = async () => {
    await connectDB();

    const uploadsDir = "./uploads";
    const uploadedFiles = fs.readdirSync(uploadsDir);
    console.log(`Found ${uploadedFiles.length} files in uploads.`);

    for (const item of food_list) {
        // Find existing image file that ends with the suffix
        const matchingFile = uploadedFiles.find(file => file.endsWith("_" + item.image_suffix));

        let imageFilename = matchingFile;
        // If we can't find a matching file, we might need to skip or use a placeholder, 
        // but for now let's hope it exists. If not, maybe use just the suffix but that won't display?
        // Let's log warning
        if (!matchingFile) {
            console.warn(`WARNING: No uploaded image found matching suffix ${item.image_suffix} for ${item.name}`);
            // Fallback: Check if the simple name exists or maybe we should just not set image if it's missing
            // But user said images are there. 
            // NOTE: The previous check showed files like 1763469751331_food_1.png
            // So logic `file.endsWith("_" + item.image_suffix)` should work for `food_1.png`. 
        }

        const foodData = {
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            // If we found a file, update the image path. If not, keep existing or... ? 
            // Upsert will create new if not found. If new and no image, that's bad.
            // Let's assume we find it or use the suffix as fallback (which might be broken but better than nothing)
            image: imageFilename || item.image_suffix,
            calories: item.macros.calories,
            protein: item.macros.protein,
            carbs: item.macros.carbs,
            fats: item.macros.fats
        };

        try {
            const result = await foodModel.findOneAndUpdate(
                { name: item.name },
                foodData,
                { upsert: true, new: true }
            );
            console.log(`Restored: ${item.name} -> Image: ${result.image}`);
        } catch (error) {
            console.error(`Error restoring ${item.name}:`, error);
        }
    }

    console.log("Restoration Complete.");
    setTimeout(() => {
        mongoose.disconnect();
    }, 2000);
}

restoreFood();
