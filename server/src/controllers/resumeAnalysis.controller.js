import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { analyzeResume } from "../services/resumeAnalysis.service.js";

export const analyzeResumeController = asyncHandler(async (req, res) => {
    const analysis = await analyzeResume({
        userId: req.user.id,
        resumeId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Resume analyzed successfully", { analysis }));
});