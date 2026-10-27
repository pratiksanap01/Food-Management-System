import mongoose from "mongoose";
import { FoodRequest } from "../models/request.model.js";
import { Food } from "../models/food.model.js";

// @desc    Create a food claim request
// @route   POST /api/requests
// @access  Protected (Receiver)
export const createRequest = async (req, res) => {
    try {
        const {
            foodId,
            quantity,
            message
        } = req.body;

        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: "Please provide foodId"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid food ID"
            });
        }

        const food = await Food.findById(foodId);

        // 1. Food exists
        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found"
            });
        }

        // Prevent donor from requesting their own food
        if (food.donor.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot request your own food donation"
            });
        }

        // 2. Food is available
        if (food.status !== "available") {
            return res.status(400).json({
                success: false,
                message: `Food is not available (Current status: ${food.status})`
            });
        }

        // 3. Food has not expired
        if (new Date(food.availableUntil) < new Date()) {
            food.status = "expired";
            await food.save();
            return res.status(400).json({
                success: false,
                message: "Food donation has expired"
            });
        }

        // 4. Validate quantity
        const reqQty = Number(quantity);
        if (isNaN(reqQty) || reqQty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid positive quantity"
            });
        }

        if (reqQty > food.quantity) {
            return res.status(400).json({
                success: false,
                message: `Requested quantity (${reqQty}) exceeds available quantity (${food.quantity})`
            });
        }

        // 5. Prevent duplicate pending requests from the same receiver
        const existingRequest = await FoodRequest.findOne({
            food: foodId,
            receiver: req.user.id,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending request for this food donation"
            });
        }

        // Create the request
        const request = await FoodRequest.create({
            food: foodId,
            receiver: req.user.id,
            quantity: reqQty,
            message: message ? message.trim() : ""
        });

        // Update food status to "requested"
        food.status = "requested";
        await food.save();

        return res.status(201).json({
            success: true,
            message: "Food request submitted successfully",
            request
        });

    } catch (error) {
        console.error("Create request error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create food request"
        });
    }
};

// @desc    Get requests made by logged-in receiver
// @route   GET /api/requests/my
// @access  Protected
export const getMyRequests = async (req, res) => {
    try {
        const requests = await FoodRequest.find({
            receiver: req.user.id
        })
        .populate({
            path: "food",
            populate: {
                path: "donor",
                select: "name email phone address"
            }
        })
        .populate("receiver", "name email phone address")
        .sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get my requests error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch your requests"
        });
    }
};

// @desc    Get requests received for food items posted by logged-in donor
// @route   GET /api/requests/received
// @access  Protected (Donor)
export const getReceivedRequests = async (req, res) => {
    try {
        // Find all food items donated by this user
        const myFoods = await Food.find({ donor: req.user.id }).select("_id");
        const foodIds = myFoods.map(item => item._id);

        // Find requests matching these food IDs
        const requests = await FoodRequest.find({
            food: { $in: foodIds }
        })
        .populate("food")
        .populate("receiver", "name email phone address")
        .sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get received requests error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch received requests"
        });
    }
};

// @desc    Accept a food request (Donor only)
// @route   PUT /api/requests/:id/accept
// @access  Protected
export const acceptRequest = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        const request = await FoodRequest.findById(req.params.id).populate("food");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        // Validate that food exists and caller is the food donor
        if (!request.food) {
            return res.status(404).json({
                success: false,
                message: "Associated food item no longer exists"
            });
        }

        if (request.food.donor.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this request. Only the food donor can accept."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}`
            });
        }

        // Update request: pending -> accepted
        request.status = "accepted";
        await request.save();

        // Update food: requested -> claimed
        request.food.status = "claimed";
        await request.food.save();

        return res.status(200).json({
            success: true,
            message: "Food request accepted successfully",
            request
        });

    } catch (error) {
        console.error("Accept request error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to accept request"
        });
    }
};

// @desc    Reject a food request (Donor only)
// @route   PUT /api/requests/:id/reject
// @access  Protected
export const rejectRequest = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        const request = await FoodRequest.findById(req.params.id).populate("food");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (!request.food) {
            return res.status(404).json({
                success: false,
                message: "Associated food item no longer exists"
            });
        }

        if (request.food.donor.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reject this request. Only the food donor can reject."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}`
            });
        }

        // Update request: pending -> rejected
        request.status = "rejected";
        await request.save();

        // Update food back to "available"
        request.food.status = "available";
        await request.food.save();

        return res.status(200).json({
            success: true,
            message: "Food request rejected",
            request
        });

    } catch (error) {
        console.error("Reject request error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to reject request"
        });
    }
};

// @desc    Complete a food request (Donor only)
// @route   PUT /api/requests/:id/complete
// @access  Protected
export const completeRequest = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        const request = await FoodRequest.findById(req.params.id).populate("food");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (!request.food) {
            return res.status(404).json({
                success: false,
                message: "Associated food item no longer exists"
            });
        }

        if (request.food.donor.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to complete this request. Only the food donor can complete."
            });
        }

        if (request.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: "Request must be accepted before marking as completed"
            });
        }

        // Update request: accepted -> completed
        request.status = "completed";
        await request.save();

        // Update food: claimed -> completed
        request.food.status = "completed";
        await request.food.save();

        return res.status(200).json({
            success: true,
            message: "Food request marked as completed",
            request
        });

    } catch (error) {
        console.error("Complete request error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to complete request"
        });
    }
};