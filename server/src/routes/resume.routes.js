import { Router } from "express";
import {
    deleteResumeController,
    getResumeByIdController,
    getResumesController,
    uploadResumeController,
} from "../controllers/resume.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadResumePdf } from "../middleware/upload.middleware.js";
import { resumeIdValidator, uploadResumeValidator } from "../validators/resume.validator.js";

/**
 * @swagger
 * /resume/upload:
 *   post:
 *     tags: [Resume]
 *     summary: Upload a resume
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resume uploaded successfully
 */

/**
 * @swagger
 * /resume:
 *   get:
 *     tags: [Resume]
 *     summary: List resumes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumes fetched successfully
 */

/**
 * @swagger
 * /resume/{id}:
 *   get:
 *     tags: [Resume]
 *     summary: Get a resume by id
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
 *         description: Resume fetched successfully
 */

/**
 * @swagger
 * /resume/{id}:
 *   delete:
 *     tags: [Resume]
 *     summary: Delete a resume
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
 *         description: Resume deleted successfully
 */

const router = Router();

// All resume routes require a valid JWT.
router.use(authMiddleware);

router.post("/upload", uploadResumePdf, uploadResumeValidator, uploadResumeController);
router.get("/", getResumesController);
router.get("/:id", resumeIdValidator, getResumeByIdController);
router.delete("/:id", resumeIdValidator, deleteResumeController);

export default router;
