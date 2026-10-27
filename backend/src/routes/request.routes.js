import express from "express";

import {
    createRequest,
    getMyRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    completeRequest
} from "../controllers/request.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    createRequest
);

router.get(
    "/my",
    protect,
    getMyRequests
);

router.get(
    "/received",
    protect,
    getReceivedRequests
);

router.put(
    "/:id/accept",
    protect,
    acceptRequest
);

router.put(
    "/:id/reject",
    protect,
    rejectRequest
);

router.put(
    "/:id/complete",
    protect,
    completeRequest
);

export default router;