import { Router } from "express";
import {
    getAnalyticsController,
    getDashboardController,
    getProgressController,
    getTopicController,
} from "../controllers/analytics.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics fetched successfully
 */

/**
 * @swagger
 * /analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get full analytics payload
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics fetched successfully
 */

/**
 * @swagger
 * /analytics/progress:
 *   get:
 *     tags: [Analytics]
 *     summary: Get progress analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics progress fetched successfully
 */

/**
 * @swagger
 * /analytics/topics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get topic analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics topics fetched successfully
 */

const router = Router();

router.use(authMiddleware);

// Dashboard and analytics share the same auth gate, but the routes stay separate for the client.
router.get("/dashboard", getDashboardController);
router.get("/analytics", getAnalyticsController);
router.get("/analytics/progress", getProgressController);
router.get("/analytics/topics", getTopicController);

export default router;