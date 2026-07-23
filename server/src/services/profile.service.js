import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const userSelect = {
    id: true,
    fullName: true,
    email: true,
    profilePic: true,
    createdAt: true,
    updatedAt: true,
};

const settingsSelect = {
    id: true,
    userId: true,
    preferredLanguage: true,
    preferredAiVoice: true,
    theme: true,
    interviewDuration: true,
    notificationPreferences: true,
    dailyGoal: true,
    weeklyGoal: true,
    createdAt: true,
    updatedAt: true,
};

const notificationSelect = {
    id: true,
    type: true,
    title: true,
    message: true,
    metadata: true,
    isRead: true,
    readAt: true,
    createdAt: true,
    updatedAt: true,
};

const normalizeNotificationPreferences = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }

    return {};
};

const getOrCreateSettings = async (userId) => {
    return prisma.settings.upsert({
        where: { userId },
        create: {
            userId,
            notificationPreferences: {},
        },
        update: {},
        select: settingsSelect,
    });
};

export const getProfile = async ({ userId }) => {
    const [user, settings] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: userSelect }),
        getOrCreateSettings(userId),
    ]);

    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    return { user, settings };
};

export const updateProfile = async ({ userId, payload }) => {
    const data = {};

    if (typeof payload.fullName === "string") {
        data.fullName = payload.fullName.trim();
    }

    if (Object.prototype.hasOwnProperty.call(payload, "profilePic")) {
        data.profilePic = payload.profilePic || null;
    }

    return prisma.user.update({
        where: { id: userId },
        data,
        select: userSelect,
    });
};

export const getSettings = async ({ userId }) => {
    return getOrCreateSettings(userId);
};

export const updateSettings = async ({ userId, payload }) => {
    const data = {};

    if (typeof payload.preferredLanguage === "string") {
        data.preferredLanguage = payload.preferredLanguage.trim();
    }

    if (typeof payload.preferredAiVoice === "string") {
        data.preferredAiVoice = payload.preferredAiVoice.trim();
    }

    if (typeof payload.theme === "string") {
        data.theme = payload.theme;
    }

    if (typeof payload.interviewDuration === "number") {
        data.interviewDuration = payload.interviewDuration;
    }

    if (typeof payload.dailyGoal === "number") {
        data.dailyGoal = payload.dailyGoal;
    }

    if (typeof payload.weeklyGoal === "number") {
        data.weeklyGoal = payload.weeklyGoal;
    }

    if (payload.notificationPreferences) {
        data.notificationPreferences = normalizeNotificationPreferences(payload.notificationPreferences);
    }

    return prisma.settings.upsert({
        where: { userId },
        create: {
            userId,
            notificationPreferences: {},
            ...data,
        },
        update: data,
        select: settingsSelect,
    });
};

export const listNotifications = async ({ userId }) => {
    const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
            select: notificationSelect,
        }),
        prisma.notification.count({
            where: { userId, isRead: false },
        }),
    ]);

    return { notifications, unreadCount };
};

export const markNotificationsAsRead = async ({ userId, notificationIds }) => {
    const where = {
        userId,
        isRead: false,
        ...(notificationIds?.length ? { id: { in: notificationIds } } : {}),
    };

    await prisma.notification.updateMany({
        where,
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return listNotifications({ userId });
};

export const deleteNotification = async ({ userId, notificationId }) => {
    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
        select: { id: true },
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await prisma.notification.delete({
        where: { id: notificationId },
    });

    return { id: notificationId };
};