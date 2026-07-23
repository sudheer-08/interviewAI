import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    createJobDescription,
    deleteJobDescriptionById,
    getJobDescriptions,
    matchJobDescription,
} from "../services/jobDescription.service.js";

export const createJobDescriptionController = asyncHandler(async (req, res) => {
    const jobDescription = await createJobDescription({
        userId: req.user.id,
        payload: req.body,
    });

    return res.status(201).json(new ApiResponse(201, "Job description created successfully", { jobDescription }));
});

export const getJobDescriptionsController = asyncHandler(async (req, res) => {
    const jobDescriptions = await getJobDescriptions(req.user.id);

    return res.status(200).json(new ApiResponse(200, "Job descriptions fetched successfully", { jobDescriptions }));
});

export const deleteJobDescriptionController = asyncHandler(async (req, res) => {
    const deletedJobDescription = await deleteJobDescriptionById({
        userId: req.user.id,
        jobDescriptionId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, "Job description deleted successfully", deletedJobDescription));
});

export const matchJobDescriptionController = asyncHandler(async (req, res) => {
    const analysis = await matchJobDescription({
        userId: req.user.id,
        jobDescriptionId: req.params.id,
        resumeId: req.body.resumeId,
    });

    return res.status(200).json(new ApiResponse(200, "Job description matched successfully", { analysis }));
});