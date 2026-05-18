import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGO_URI = process.env.MONGO_URI;

// Define Minimal Schema
const foodSchema = new mongoose.Schema({
  name: String,
  image: String,
});
const Food = mongoose.models.food || mongoose.model('food', foodSchema);

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected Successfully.");

    const foods = await Food.find({});
    console.log(`Found ${foods.length} items in core database.`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const food of foods) {
      if (food.image && (food.image.startsWith('http') || food.image.startsWith('https'))) {
        console.log(`[SKIP] ${food.name} already has a cloud URL.`);
        skipCount++;
        continue;
      }

      console.log(`[PROCESS] ${food.name} (Local image: ${food.image})`);

      // Search locations
      const possiblePaths = [
        path.join('uploads', food.image),
        path.join('..', 'uploads', food.image),
        path.join('..', 'frontend', 'src', 'assets', food.image),
        path.join('..', 'mobile', 'src', 'assets', food.image)
      ];

      let foundPath = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }

      if (foundPath) {
        try {
          console.log(`      Found at: ${foundPath}. Uploading to Cloudinary...`);
          const result = await cloudinary.uploader.upload(foundPath, {
            folder: "nutritomato_foods",
          });

          await Food.findByIdAndUpdate(food._id, { image: result.secure_url });
          console.log(`      SUCCESS: ${result.secure_url}`);
          successCount++;
        } catch (uploadErr) {
          console.error(`      UPLOAD FAILED for ${food.name}:`, uploadErr.message);
          failCount++;
        }
      } else {
        console.log(`      [ERROR] File not found in any local path.`);
        failCount++;
      }
    }

    console.log("\n--- Migration Summary ---");
    console.log(`Total Processed: ${foods.length}`);
    console.log(`Successfully Uploaded: ${successCount}`);
    console.log(`Skipped (Already Cloud): ${skipCount}`);
    console.log(`Failed: ${failCount}`);
    console.log("--------------------------");

  } catch (err) {
    console.error("Migration Fatal Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

migrate();
