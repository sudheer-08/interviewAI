import { PDFParse } from "pdf-parse";
import ensureCloudinaryConfigured from "../config/cloudinary.js";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

// Fields returned to the client for resume resources.
const resumeSelect = {
    id: true,
    title: true,
    fileUrl: true,
    publicId: true,
    parsedText: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

// Lighter payload for list responses — parsedText can be large.
const resumeListSelect = {
    id: true,
    title: true,
    fileUrl: true,
    publicId: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

/**
 * Uploads a PDF buffer to Cloudinary as a raw asset.
 */
const uploadPdfToCloudinary = (fileBuffer) => {
    const cloudinary = ensureCloudinaryConfigured();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "interview-ai/resumes",
                resource_type: "raw",
                format: "pdf",
            },
            (error, result) => {
                if (error) {
                    reject(new ApiError(500, "Failed to upload resume to Cloudinary"));
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Removes a previously uploaded resume file from Cloudinary.
 */
const deleteFromCloudinary = async (publicId) => {
    const cloudinary = ensureCloudinaryConfigured();

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (error) {
        throw new ApiError(500, "Failed to delete resume from Cloudinary");
    }
};

/**
 * Extracts plain text from a PDF buffer for downstream AI interview features.
 */
const extractPdfText = async (fileBuffer) => {
    const parser = new PDFParse({ data: fileBuffer });

    try {
        const parsedPdf = await parser.getText();
        return parsedPdf.text?.trim() || "";
    } catch {
        throw new ApiError(400, "Unable to parse PDF file");
    } finally {
        await parser.destroy();
    }
};

/**
 * Upload a resume PDF, store Cloudinary metadata, and persist parsed text.
 */
export const uploadResume = async ({ userId, title, file }) => {
    const parsedText = await extractPdfText(file.buffer);
    const uploadResult = await uploadPdfToCloudinary(file.buffer);

    try {
        const resume = await prisma.resume.create({
            data: {
                title,
                fileUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                parsedText,
                userId,
            },
            select: resumeSelect,
        });

        return resume;
    } catch (error) {
        // Roll back the Cloudinary upload if database persistence fails.
        await deleteFromCloudinary(uploadResult.public_id);
        throw error;
    }
};

/**
 * Return all resumes belonging to the authenticated user.
 */
export const getUserResumes = async (userId) => {
    const resumes = await prisma.resume.findMany({
        where: { userId },
        select: resumeListSelect,
        orderBy: { createdAt: "desc" },
    });

    return resumes;
};

/**
 * Fetch a single resume and enforce ownership.
 */
export const getResumeById = async ({ userId, resumeId }) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
        select: resumeSelect,
    });

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    return resume;
};

/**
 * Delete a resume from PostgreSQL and remove its Cloudinary asset.
 */
export const deleteResumeById = async ({ userId, resumeId }) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
        select: {
            id: true,
            publicId: true,
        },
    });

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    await deleteFromCloudinary(resume.publicId);

    await prisma.resume.delete({
        where: { id: resume.id },
    });

    return { id: resume.id };
};
