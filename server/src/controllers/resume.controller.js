import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    deleteResumeById,
    getResumeById,
    getUserResumes,
    uploadResume,
} from "../services/resume.service.js";

/**
 * POST /api/v1/resume/upload
 * Accepts multipart/form-data: file (PDF) + title.
 */
export const uploadResumeController = asyncHandler(async (req, res) => {
    const { title } = req.body;

    const resume = await uploadResume({
        userId: req.user.id,
        title,
        file: req.file,
    });

    return res.status(201).json(new ApiResponse(201, "Resume uploaded successfully", { resume }));
});

/**
 * GET /api/v1/resume
 * Returns all resumes for the authenticated user.
 */
export const getResumesController = asyncHandler(async (req, res) => {
    const resumes = await getUserResumes(req.user.id);

    return res.status(200).json(new ApiResponse(200, "Resumes fetched successfully", { resumes }));
});

/**
 * GET /api/v1/resume/:id
 * Returns one resume if it belongs to the authenticated user.
 */
export const getResumeByIdController = asyncHandler(async (req, res) => {
    const resume = await getResumeById({
        userId: req.user.id,
        resumeId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Resume fetched successfully", { resume }));
});

/**
 * DELETE /api/v1/resume/:id
 * Deletes resume metadata and its Cloudinary file.
 */
export const deleteResumeController = asyncHandler(async (req, res) => {
    const deletedResume = await deleteResumeById({
        userId: req.user.id,
        resumeId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Resume deleted successfully", deletedResume));
});
