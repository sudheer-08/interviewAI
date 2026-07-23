import { Router } from "express";
import {
    deleteNotificationController,
    getNotificationsController,
    getProfileController,
    getSettingsController,
    readNotificationsController,
    updateProfileController,
    updateSettingsController,
} from "../controllers/profile.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    profileUpdateValidator,
    readNotificationsValidator,
    settingsUpdateValidator,
} from "../validators/profile.validator.js";

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get the current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */

/**
 * @swagger
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update the current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get user settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings fetched successfully
 */

/**
 * @swagger
 * /settings:
 *   put:
 *     tags: [Settings]
 *     summary: Update user settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */

/**
 * @swagger
 * /notifications/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */

const router = Router();

router.use(authMiddleware);

router.get("/profile", getProfileController);
router.put("/profile", profileUpdateValidator, updateProfileController);
router.get("/settings", getSettingsController);
router.put("/settings", settingsUpdateValidator, updateSettingsController);
router.get("/notifications", getNotificationsController);
router.put("/notifications/read", readNotificationsValidator, readNotificationsController);
router.delete("/notifications/:id", deleteNotificationController);

export default router;