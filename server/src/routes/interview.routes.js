import { Router } from "express";
import {
	answerInterviewController,
	createInterviewController,
	endInterviewController,
	getInterviewTranscriptController,
	startInterviewController,
} from "../controllers/interview.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadInterviewAudio } from "../middleware/upload.middleware.js";
import {
	answerInterviewValidator,
	createInterviewValidator,
	interviewIdValidator,
} from "../validators/interview.validator.js";

/**
 * @swagger
 * /interview/create:
 *   post:
 *     tags: [Interview]
 *     summary: Create an interview session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Interview session created successfully
 */

/**
 * @swagger
 * /interview/{id}/start:
 *   post:
 *     tags: [Interview]
 *     summary: Start an interview session
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
 *         description: Interview session started successfully
 */

/**
 * @swagger
 * /interview/{id}/answer:
 *   post:
 *     tags: [Interview]
 *     summary: Submit an interview answer
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
 *         description: Interview answer evaluated successfully
 */

/**
 * @swagger
 * /interview/{id}/end:
 *   post:
 *     tags: [Interview]
 *     summary: End an interview session
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
 *         description: Interview session ended successfully
 */

/**
 * @swagger
 * /interview/{id}/transcript:
 *   get:
 *     tags: [Interview]
 *     summary: Get an interview transcript
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
 *         description: Interview transcript fetched successfully
 */

const router = Router();

router.use(authMiddleware);

router.post("/create", createInterviewValidator, createInterviewController);
router.post("/:id/start", interviewIdValidator, startInterviewController);
router.post("/:id/answer", interviewIdValidator, uploadInterviewAudio, answerInterviewValidator, answerInterviewController);
router.post("/:id/end", interviewIdValidator, endInterviewController);
router.get("/:id/transcript", interviewIdValidator, getInterviewTranscriptController);

export default router;