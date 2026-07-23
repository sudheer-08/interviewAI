import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    getDashboardAnalytics,
    getFullAnalytics,
    getProgressAnalytics,
    getTopicAnalytics,
} from "../services/analytics.service.js";

export const getDashboardController = asyncHandler(async (req, res) => {
    const dashboard = await getDashboardAnalytics({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Dashboard analytics fetched successfully", { dashboard }));
});

export const getAnalyticsController = asyncHandler(async (req, res) => {
    const analytics = await getFullAnalytics({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Analytics fetched successfully", { analytics }));
});

export const getProgressController = asyncHandler(async (req, res) => {
    const progress = await getProgressAnalytics({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Analytics progress fetched successfully", { progress }));
});

export const getTopicController = asyncHandler(async (req, res) => {
    const topics = await getTopicAnalytics({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Analytics topics fetched successfully", { topics }));
});