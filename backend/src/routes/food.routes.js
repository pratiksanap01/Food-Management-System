import express from "express";
import {
    addFood,
    getAvailableFood,
    getFoodById,
    getMyFood,
    updateFood,
    deleteFood
} from "../controllers/food.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Error handler wrapper for multer errors
const handleUpload = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || "File upload error"
            });
        }
        next();
    });
};

router.post("/", protect, handleUpload, addFood);
router.get("/available", protect, getAvailableFood);
router.get("/my", protect, getMyFood);
router.get("/:id", protect, getFoodById);
router.put("/:id", protect, handleUpload, updateFood);
router.delete("/:id", protect, deleteFood);

export default router;