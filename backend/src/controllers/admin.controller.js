import { User } from "../models/user.model.js";
import { Food } from "../models/food.model.js";
import { FoodRequest } from "../models/request.model.js";

// @desc    Get system-wide summary statistics for admin
// @route   GET /api/admin/dashboard
// @access  Protected (Admin only)
export const getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonors = await User.countDocuments({ role: "donor" });
        const totalReceivers = await User.countDocuments({ role: "receiver" });
        const totalFood = await Food.countDocuments();
        const availableFood = await Food.countDocuments({ status: "available" });
        const totalRequests = await FoodRequest.countDocuments();
        const completedRequests = await FoodRequest.countDocuments({ status: "completed" });

        return res.status(200).json({
            success: true,
            dashboard: {
                totalUsers,
                totalDonors,
                totalReceivers,
                totalFood,
                availableFood,
                totalRequests,
                completedRequests
            }
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch admin stats"
        });
    }
};

// @desc    Get all registered users (passwords excluded)
// @route   GET /api/admin/users
// @access  Protected (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Admin get users error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users"
        });
    }
};

// @desc    Get all food donations
// @route   GET /api/admin/food
// @access  Protected (Admin only)
export const getAllFood = async (req, res) => {
    try {
        const food = await Food.find()
            .populate("donor", "name email phone address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: food.length,
            food
        });

    } catch (error) {
        console.error("Admin get food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch all food"
        });
    }
};

// @desc    Get all food requests
// @route   GET /api/admin/requests
// @access  Protected (Admin only)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await FoodRequest.find()
            .populate({
                path: "food",
                populate: {
                    path: "donor",
                    select: "name email phone"
                }
            })
            .populate("receiver", "name email phone address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Admin get requests error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch all requests"
        });
    }
};
