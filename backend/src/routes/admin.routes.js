import express from "express";

import {
    getDashboard,
    getAllUsers,
    getAllFood,
    getAllRequests
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    adminOnly,
    getDashboard
);

router.get(
    "/users",
    protect,
    adminOnly,
    getAllUsers
);

router.get(
    "/food",
    protect,
    adminOnly,
    getAllFood
);

router.get(
    "/requests",
    protect,
    adminOnly,
    getAllRequests
);

export default router;