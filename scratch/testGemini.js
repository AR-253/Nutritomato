import { identifyFoodWithGemini } from "../backend/utils/geminiHelper.js";
import fs from "fs";

async function test() {
    const buffer = Buffer.from("test"); // dummy
    const res = await identifyFoodWithGemini(buffer, "image/jpeg");
    console.log("Test Result:", res);
}

test();
