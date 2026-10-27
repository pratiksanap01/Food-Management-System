import mongoose from "mongoose";
import { Food } from "../models/food.model.js";
import { FoodRequest } from "../models/request.model.js";
import { uploadToCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

// @desc    Add a new food donation
// @route   POST /api/food
// @access  Protected (Logged-in donors)
export const addFood = async (req, res) => {
    try {
        const {
            title,
            description,
            foodType,
            quantity,
            unit,
            location,
            availableUntil,
            image: imageUrlFromBody
        } = req.body;

        // Validate required fields
        if (!title || !foodType || !quantity || !unit || !location || !availableUntil) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: title, foodType, quantity, unit, location, and availableUntil"
            });
        }

        // Validate quantity
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive number"
            });
        }

        // Handle optional image upload (from file or direct URL string)
        let finalImageUrl = imageUrlFromBody || "";

        if (req.file) {
            if (isCloudinaryConfigured()) {
                try {
                    finalImageUrl = await uploadToCloudinary(req.file.buffer);
                } catch (uploadErr) {
                    console.warn("Cloudinary upload failed, continuing without uploaded image:", uploadErr.message);
                }
            } else {
                console.warn("Cloudinary is not configured. Saving food donation without uploaded image.");
            }
        }

        // Create food document
        const food = await Food.create({
            donor: req.user.id,
            title: title.trim(),
            description: description ? description.trim() : "",
            foodType,
            quantity: numQuantity,
            unit,
            location: location.trim(),
            availableUntil: new Date(availableUntil),
            image: finalImageUrl,
            status: "available"
        });

        return res.status(201).json({
            success: true,
            message: "Food donation created successfully",
            food
        });

    } catch (error) {
        console.error("Add food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create food donation"
        });
    }
};

// @desc    Get all available and non-expired food donations
// @route   GET /api/food/available
// @access  Protected
export const getAvailableFood = async (req, res) => {
    try {
        const food = await Food.find({
            status: "available",
            availableUntil: {
                $gt: new Date()
            }
        })
        .populate("donor", "name email phone address")
        .sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: food.length,
            food
        });

    } catch (error) {
        console.error("Get available food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch available food"
        });
    }
};

// @desc    Get single food donation by ID
// @route   GET /api/food/:id
// @access  Protected
export const getFoodById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid food ID"
            });
        }

        const food = await Food.findById(req.params.id).populate(
            "donor",
            "name email phone address"
        );

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found"
            });
        }

        return res.status(200).json({
            success: true,
            food
        });

    } catch (error) {
        console.error("Get food by id error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch food details"
        });
    }
};

// @desc    Get food donations by logged-in donor
// @route   GET /api/food/my
// @access  Protected
export const getMyFood = async (req, res) => {
    try {
        const food = await Food.find({
            donor: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: food.length,
            food
        });

    } catch (error) {
        console.error("Get my food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch your food donations"
        });
    }
};

// @desc    Update food donation (Only owner)
// @route   PUT /api/food/:id
// @access  Protected
export const updateFood = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid food ID"
            });
        }

        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food donation not found"
            });
        }

        // Ownership check
        if (food.donor.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this food donation"
            });
        }

        const {
            title,
            description,
            foodType,
            quantity,
            unit,
            location,
            availableUntil,
            status
        } = req.body;

        if (title) food.title = title.trim();
        if (description !== undefined) food.description = description.trim();
        if (foodType) food.foodType = foodType;
        if (quantity) food.quantity = Number(quantity);
        if (unit) food.unit = unit;
        if (location) food.location = location.trim();
        if (availableUntil) food.availableUntil = new Date(availableUntil);
        if (status) food.status = status;

        if (req.file && isCloudinaryConfigured()) {
            try {
                food.image = await uploadToCloudinary(req.file.buffer);
            } catch (uploadErr) {
                console.warn("Cloudinary upload failed on update:", uploadErr.message);
            }
        }

        await food.save();

        return res.status(200).json({
            success: true,
            message: "Food donation updated successfully",
            food
        });

    } catch (error) {
        console.error("Update food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update food donation"
        });
    }
};

// @desc    Delete food donation (Only owner or admin)
// @route   DELETE /api/food/:id
// @access  Protected
export const deleteFood = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid food ID"
            });
        }

        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food donation not found"
            });
        }

        // Ownership check
        if (food.donor.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this food donation"
            });
        }

        // Delete associated requests
        await FoodRequest.deleteMany({ food: food._id });
        await food.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Food donation deleted successfully"
        });

    } catch (error) {
        console.error("Delete food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete food donation"
        });
    }
};