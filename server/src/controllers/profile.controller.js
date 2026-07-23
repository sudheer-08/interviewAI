import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    deleteNotification,
    getProfile,
    getSettings,
    listNotifications,
    markNotificationsAsRead,
    updateProfile,
    updateSettings,
} from "../services/profile.service.js";

export const getProfileController = asyncHandler(async (req, res) => {
    const profile = await getProfile({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Profile fetched successfully", { profile }));
});

export const updateProfileController = asyncHandler(async (req, res) => {
    const profile = await updateProfile({ userId: req.user.id, payload: req.body });

    return res.status(200).json(new ApiResponse(200, "Profile updated successfully", { profile }));
});

export const getSettingsController = asyncHandler(async (req, res) => {
    const settings = await getSettings({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Settings fetched successfully", { settings }));
});

export const updateSettingsController = asyncHandler(async (req, res) => {
    const settings = await updateSettings({ userId: req.user.id, payload: req.body });

    return res.status(200).json(new ApiResponse(200, "Settings updated successfully", { settings }));
});

export const getNotificationsController = asyncHandler(async (req, res) => {
    const notifications = await listNotifications({ userId: req.user.id });

    return res.status(200).json(new ApiResponse(200, "Notifications fetched successfully", notifications));
});

export const readNotificationsController = asyncHandler(async (req, res) => {
    const notifications = await markNotificationsAsRead({
        userId: req.user.id,
        notificationIds: req.body.notificationIds,
    });

    return res.status(200).json(new ApiResponse(200, "Notifications marked as read successfully", notifications));
});

export const deleteNotificationController = asyncHandler(async (req, res) => {
    const notification = await deleteNotification({
        userId: req.user.id,
        notificationId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Notification deleted successfully", { notification }));
});