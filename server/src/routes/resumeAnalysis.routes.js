import { Router } from "express";
import { analyzeResumeController } from "../controllers/resumeAnalysis.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { resumeIdValidator } from "../validators/resume.validator.js";

/**
 * @swagger
 * /resume/{id}/analyze:
 *   post:
 *     tags: [Resume Analysis]
 *     summary: Analyze a resume
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
 *         description: Resume analyzed successfully
 */

const router = Router();

router.use(authMiddleware);

router.post("/:id/analyze", resumeIdValidator, analyzeResumeController);

export default router;