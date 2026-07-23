import { Router } from "express";
import {
    createJobDescriptionController,
    deleteJobDescriptionController,
    getJobDescriptionsController,
    matchJobDescriptionController,
} from "../controllers/jobDescription.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    createJobDescriptionValidator,
    jobDescriptionIdValidator,
    matchJobDescriptionValidator,
} from "../validators/jobDescription.validator.js";

/**
 * @swagger
 * /job-description:
 *   post:
 *     tags: [Job Description]
 *     summary: Create a job description
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Job description created successfully
 */

/**
 * @swagger
 * /job-description:
 *   get:
 *     tags: [Job Description]
 *     summary: List job descriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job descriptions fetched successfully
 */

/**
 * @swagger
 * /job-description/{id}:
 *   delete:
 *     tags: [Job Description]
 *     summary: Delete a job description
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
 *         description: Job description deleted successfully
 */

/**
 * @swagger
 * /job-description/{id}/match:
 *   post:
 *     tags: [Job Description]
 *     summary: Match a resume to a job description
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
 *         description: Job description matched successfully
 */

const router = Router();

router.use(authMiddleware);

router.post("/", createJobDescriptionValidator, createJobDescriptionController);
router.get("/", getJobDescriptionsController);
router.delete("/:id", jobDescriptionIdValidator, deleteJobDescriptionController);
router.post("/:id/match", jobDescriptionIdValidator, matchJobDescriptionValidator, matchJobDescriptionController);

export default router;