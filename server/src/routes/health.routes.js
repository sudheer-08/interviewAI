import { Router } from "express";
import prisma from "../config/prisma.js";

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Check service health
 *     responses:
 *       200:
 *         description: Health status returned successfully
 */

const router = Router();

router.get("/health", async (_req, res) => {
    let database = "down";

    try {
        await prisma.$queryRaw`SELECT 1`;
        database = "up";
    } catch {
        database = "down";
    }

    return res.status(200).json({
        status: "ok",
        database,
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
    });
});

export default router;