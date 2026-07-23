import { z } from "zod";
import prisma from "../config/prisma.js";
import { buildJobDescriptionMatchPrompt } from "../prompts/jdMatching.prompt.js";
import ApiError from "../utils/ApiError.js";
import { getAiConfig } from "../config/ai.js";

const MAX_RESUME_TEXT_LENGTH = 15000;
const MAX_JOB_DESCRIPTION_TEXT_LENGTH = 12000;

const jobDescriptionSelect = {
    id: true,
    title: true,
    company: true,
    description: true,
    requiredSkills: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

const matchSelect = {
    id: true,
    jobDescriptionId: true,
    resumeId: true,
    modelName: true,
    matchPercent: true,
    missingSkills: true,
    missingKeywords: true,
    resumeImprovements: true,
    likelyInterviewTopics: true,
    createdAt: true,
    updatedAt: true,
};

const matchSchema = z.object({
    matchPercent: z.number().int().min(0).max(100),
    missingSkills: z.array(z.string().trim().min(1)).default([]),
    missingKeywords: z.array(z.string().trim().min(1)).default([]),
    resumeImprovements: z.array(z.string().trim().min(1)).default([]),
    likelyInterviewTopics: z.array(z.string().trim().min(1)).default([]),
});

const normalizeStringList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\r?\n|,|;/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeScore = (value) => {
    const score = Number(value);

    if (!Number.isFinite(score)) {
        throw new ApiError(502, "AI matching returned an invalid matchPercent");
    }

    return Math.max(0, Math.min(100, Math.round(score)));
};

const extractJsonObject = (content) => {
    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(502, "AI matching returned an empty response");
    }

    try {
        return JSON.parse(content);
    } catch {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new ApiError(502, "AI matching returned invalid JSON");
        }

        try {
            return JSON.parse(content.slice(firstBrace, lastBrace + 1));
        } catch {
            throw new ApiError(502, "AI matching returned invalid JSON");
        }
    }
};

const normalizeMatchPayload = (payload) =>
    matchSchema.parse({
        matchPercent: normalizeScore(payload.matchPercent),
        missingSkills: normalizeStringList(payload.missingSkills),
        missingKeywords: normalizeStringList(payload.missingKeywords),
        resumeImprovements: normalizeStringList(payload.resumeImprovements),
        likelyInterviewTopics: normalizeStringList(payload.likelyInterviewTopics),
    });

const getOpenAiConfig = () => {
    const { apiKey, model, baseUrl } = getAiConfig();

    return { apiKey, model, baseUrl };
};

const getJobDescriptionForUser = async ({ userId, jobDescriptionId }) => {
    const jobDescription = await prisma.jobDescription.findFirst({
        where: {
            id: jobDescriptionId,
            userId,
        },
        select: jobDescriptionSelect,
    });

    if (!jobDescription) {
        throw new ApiError(404, "Job description not found");
    }

    return jobDescription;
};

const getResumeForUser = async ({ userId, resumeId }) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
        select: {
            id: true,
            title: true,
            parsedText: true,
        },
    });

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    if (!resume.parsedText?.trim()) {
        throw new ApiError(400, "Resume text is not available for matching");
    }

    return resume;
};

const callMatchModel = async ({ jobDescription, resume }) => {
    const { apiKey, model, baseUrl } = getOpenAiConfig();

    const prompt = buildJobDescriptionMatchPrompt({
        jobTitle: jobDescription.title,
        company: jobDescription.company,
        jobDescription: jobDescription.description.slice(0, MAX_JOB_DESCRIPTION_TEXT_LENGTH),
        requiredSkills: normalizeStringList(jobDescription.requiredSkills),
        resumeTitle: resume.title,
        resumeText: resume.parsedText.slice(0, MAX_RESUME_TEXT_LENGTH),
        resumeTruncated: resume.parsedText.length >= MAX_RESUME_TEXT_LENGTH,
        jobDescriptionTruncated: jobDescription.description.length >= MAX_JOB_DESCRIPTION_TEXT_LENGTH,
    });

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: prompt.systemPrompt },
                { role: "user", content: prompt.userPrompt },
            ],
        }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = payload?.error?.message || "Failed to generate job description match";
        throw new ApiError(502, errorMessage);
    }

    const content = payload?.choices?.[0]?.message?.content;
    const parsedPayload = extractJsonObject(content);

    return {
        model,
        match: normalizeMatchPayload(parsedPayload),
    };
};

export const createJobDescription = async ({ userId, payload }) => {
    const requiredSkills = normalizeStringList(payload.requiredSkills);

    if (requiredSkills.length === 0) {
        throw new ApiError(400, "At least one required skill is required");
    }

    return prisma.jobDescription.create({
        data: {
            title: payload.title.trim(),
            company: payload.company.trim(),
            description: payload.description.trim(),
            requiredSkills,
            userId,
        },
        select: jobDescriptionSelect,
    });
};

export const getJobDescriptions = async (userId) => {
    return prisma.jobDescription.findMany({
        where: { userId },
        select: jobDescriptionSelect,
        orderBy: { createdAt: "desc" },
    });
};

export const deleteJobDescriptionById = async ({ userId, jobDescriptionId }) => {
    const jobDescription = await prisma.jobDescription.findFirst({
        where: {
            id: jobDescriptionId,
            userId,
        },
        select: {
            id: true,
        },
    });

    if (!jobDescription) {
        throw new ApiError(404, "Job description not found");
    }

    await prisma.jobDescription.delete({
        where: { id: jobDescription.id },
    });

    return { id: jobDescription.id };
};

export const matchJobDescription = async ({ userId, jobDescriptionId, resumeId }) => {
    const [jobDescription, resume] = await Promise.all([
        getJobDescriptionForUser({ userId, jobDescriptionId }),
        getResumeForUser({ userId, resumeId }),
    ]);

    const { model, match } = await callMatchModel({
        jobDescription,
        resume,
    });

    return prisma.jobDescriptionMatch.create({
        data: {
            jobDescriptionId: jobDescription.id,
            resumeId: resume.id,
            modelName: model,
            ...match,
        },
        select: matchSelect,
    });
};
