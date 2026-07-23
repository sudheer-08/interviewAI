import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createInterview } from "../services/interview.service.js";
import {
    answerInterviewConversation,
    endInterviewConversation,
    getInterviewConversationTranscript,
    startInterviewConversation,
} from "../services/conversation.service.js";

export const createInterviewController = asyncHandler(async (req, res) => {
    const interview = await createInterview({
        userId: req.user.id,
        payload: req.body,
    });

    return res.status(201).json(new ApiResponse(201, "Interview session created successfully", { interview }));
});

export const startInterviewController = asyncHandler(async (req, res) => {
    const result = await startInterviewConversation({
        userId: req.user.id,
        interviewId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Interview session started successfully", result));
});

export const answerInterviewController = asyncHandler(async (req, res) => {
    const result = await answerInterviewConversation({
        userId: req.user.id,
        interviewId: req.params.id,
        audioFile: req.file,
        transcriptText: req.body.transcript,
        durationSeconds: req.body.durationSeconds,
    });

    return res.status(200).json(new ApiResponse(200, "Interview answer evaluated successfully", result));
});

export const endInterviewController = asyncHandler(async (req, res) => {
    const result = await endInterviewConversation({
        userId: req.user.id,
        interviewId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Interview session ended successfully", result));
});

export const getInterviewTranscriptController = asyncHandler(async (req, res) => {
    const result = await getInterviewConversationTranscript({
        userId: req.user.id,
        interviewId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Interview transcript fetched successfully", result));
});