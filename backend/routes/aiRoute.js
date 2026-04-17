import express from "express"
import { chatWithAI } from "../controllers/aiController.js"
import multer from "multer"

const aiRouter = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

aiRouter.post("/chat", upload.single("image"), chatWithAI);

export default aiRouter;
