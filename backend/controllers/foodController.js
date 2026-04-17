import { v2 as cloudinary } from 'cloudinary';
import foodModel from "../models/foodModel.js";
import { original_foods } from "./restore_data.js";

// Add food item
const addFood = async (req, res) => {
  // Check if req.file exists (added by multer-storage-cloudinary)
  if (!req.file) {
    return res.json({ success: false, message: "Image upload failed" });
  }

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    calories: req.body.calories,
    protein: req.body.protein,
    carbs: req.body.carbs,
    fats: req.body.fats,
    image: req.file.path, // Cloudinary provides the full secure URL here
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added Successfully" });
  } catch (error) {
    console.error("Error adding food:", error);
    res.json({ success: false, message: "Error adding food" });
  }
};

// All food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error fetching food list:", error);
    res.json({ success: false, message: "Error fetching food list" });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    // Delete image from Cloudinary if it's a cloud link
    if (food.image.includes("cloudinary.com")) {
      const publicId = food.image.split('/').pop().split('.')[0];
      const folderPath = "nutritomato_foods/";
      await cloudinary.uploader.destroy(folderPath + publicId);
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed Successfully" });
  } catch (error) {
    console.error("Error removing food:", error);
    res.json({ success: false, message: "Error removing food" });
  }
};

// Seeding Data
const seedDatabase = async (req, res) => {
  try {
    // 1. Scan uploads folder for original items (timestamped ones)
    const uploadsDir = "uploads";
    const files = fs.readdirSync(uploadsDir);
    const restoredItems = [];

    files.forEach(file => {
      // Look for files ending in _food_N.png
      const match = file.match(/_food_(\d+)\.png$/);
      if (match) {
        const foodId = match[1];
        const meta = original_foods.find(f => f.id === foodId);
        if (meta) {
          restoredItems.push({
            name: meta.name,
            description: meta.description,
            price: meta.price,
            category: meta.category,
            calories: meta.calories,
            protein: meta.protein,
            carbs: meta.carbs,
            fats: meta.fats,
            image: file // Use the actual timestamped filename
          });
        }
      }
    });

    // 2. Pakistani Food Seed Data
    const pakistaniFoods = [
      {
        name: "Special Chicken Biryani",
        description: "Aromatic basmati rice cooked with spicy chicken and traditional herbs, served with raita.",
        price: 450,
        image: "food_biryani.png",
        category: "Desi",
        calories: 650,
        protein: 35,
        fats: 20,
        carbs: 80
      },
      {
        name: "Mutton Karahi (Half)",
        description: "Tender mutton pieces cooked in a rich, spicy tomato-based gravy in a traditional wok.",
        price: 1200,
        image: "food_karahi.png",
        category: "Desi",
        calories: 800,
        protein: 50,
        fats: 60,
        carbs: 10
      },
      {
        name: "Special Nihari",
        description: "Slow-cooked beef stew with a rich, thick gravy, best served with naan.",
        price: 850,
        image: "food_nihari.png",
        category: "Desi",
        calories: 700,
        protein: 45,
        fats: 50,
        carbs: 15
      },
      {
        name: "Daal Chawal Platter",
        description: "Comfort food platter: Yellow lentil curry served with boiled rice and shami kebab.",
        price: 350,
        image: "food_daal_chawal.png",
        category: "Pure Veg",
        calories: 450,
        protein: 15,
        fats: 10,
        carbs: 70
      },
      {
        name: "Chicken Paratha Roll",
        description: "Crispy paratha wrapped around spicy grilled chicken chunks and chutney.",
        price: 250,
        image: "food_paratha_roll.png",
        category: "Rolls",
        calories: 550,
        protein: 25,
        fats: 30,
        carbs: 45
      },
      {
        name: "Zinger Burger",
        description: "Crispy fried chicken fillet in a soft bun with cheese and mayo.",
        price: 490,
        image: "food_zinger.png",
        category: "Sandwich",
        calories: 600,
        protein: 28,
        fats: 35,
        carbs: 50
      },
      {
        name: "Club Sandwich",
        description: "Classic double-decker sandwich with chicken, egg, cheese, and vegetables.",
        price: 400,
        image: "food_club_sandwich.png",
        category: "Sandwich",
        calories: 450,
        protein: 25,
        fats: 20,
        carbs: 40
      },
      {
        name: "Chicken Chowmein",
        description: "Desi style stir-fried noodles with chicken and fresh vegetables.",
        price: 550,
        image: "food_chowmein.png",
        category: "Noodles",
        calories: 500,
        protein: 25,
        fats: 15,
        carbs: 65
      },
      {
        name: "Creamy Tikka Pasta",
        description: "Penne pasta tossed in a spicy, creamy tomato sauce with chicken tikka chunks.",
        price: 600,
        image: "food_tikka_pasta.png",
        category: "Pasta",
        calories: 750,
        protein: 35,
        fats: 40,
        carbs: 60
      },
      {
        name: "Gulab Jamun (2 pcs)",
        description: "Traditional milk-solid dumplings dipped in rose-flavored sugar syrup.",
        price: 200,
        image: "food_gulab_jamun.png",
        category: "Desserts",
        calories: 300,
        protein: 4,
        fats: 12,
        carbs: 55
      }
    ];

    // 3. Insert and prevent duplicates
    const allItemsToSeed = [...restoredItems, ...pakistaniFoods];
    
    let addedCount = 0;
    for (const itemData of allItemsToSeed) {
      const exists = await foodModel.findOne({ name: itemData.name });
      if (!exists) {
        const item = new foodModel(itemData);
        await item.save();
        addedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Database Updated! Added ${addedCount} new/recovered items.`,
      status: {
        restoredFromUploads: restoredItems.length,
        pakistaniAdded: pakistaniFoods.length
      }
    });

  } catch (error) {
    console.error("Error seeding/restoring DB:", error);
    res.json({ success: false, message: "Error restoring DB" });
  }
}

// Update food item
const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, category, calories, protein, carbs, fats } = req.body;
    const food = await foodModel.findById(id);
    
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    let image_url = food.image;
    if (req.file) {
      // If there's an old Cloudinary image, delete it
      if (food.image.includes("cloudinary.com")) {
        const publicId = food.image.split('/').pop().split('.')[0];
        const folderPath = "nutritomato_foods/";
        await cloudinary.uploader.destroy(folderPath + publicId);
      }
      image_url = req.file.path; // New Cloudinary URL
    }

    await foodModel.findByIdAndUpdate(id, {
      name,
      description,
      price: Number(price),
      category,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      image: image_url
    });

    res.json({ success: true, message: "Food Updated Successfully" });
  } catch (error) {
    console.error("Error updating food:", error);
    res.json({ success: false, message: "Error updating food" });
  }
};

export { addFood, listFood, removeFood, seedDatabase, updateFood };
