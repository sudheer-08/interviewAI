import { z } from "zod";
import prisma from "../config/prisma.js";
import { buildResumeAnalysisPrompt } from "../prompts/resumeAnalysis.prompt.js";
import ApiError from "../utils/ApiError.js";
import { getAiConfig } from "../config/ai.js";

const MAX_ANALYSIS_TEXT_LENGTH = 15000;

const analysisSchema = z.object({
    resumeScore: z.number().int().min(0).max(100),
    atsScore: z.number().int().min(0).max(100),
    strengths: z.array(z.string().trim().min(1)).default([]),
    weaknesses: z.array(z.string().trim().min(1)).default([]),
    missingSkills: z.array(z.string().trim().min(1)).default([]),
    grammarIssues: z.array(z.string().trim().min(1)).default([]),
    formattingIssues: z.array(z.string().trim().min(1)).default([]),
    improvementTips: z.array(z.string().trim().min(1)).default([]),
    suggestedProjects: z.array(z.string().trim().min(1)).default([]),
});

const analysisSelect = {
    id: true,
    resumeId: true,
    modelName: true,
    resumeScore: true,
    atsScore: true,
    strengths: true,
    weaknesses: true,
    missingSkills: true,
    grammarIssues: true,
    formattingIssues: true,
    improvementTips: true,
    suggestedProjects: true,
    createdAt: true,
    updatedAt: true,
};

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

const normalizeScore = (value, fieldName) => {
    const score = Number(value);

    if (!Number.isFinite(score)) {
        throw new ApiError(502, `AI analysis returned an invalid ${fieldName}`);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
};

const extractJsonObject = (content) => {
    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(502, "AI analysis returned an empty response");
    }

    try {
        return JSON.parse(content);
    } catch {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new ApiError(502, "AI analysis returned invalid JSON");
        }

        try {
            return JSON.parse(content.slice(firstBrace, lastBrace + 1));
        } catch {
            throw new ApiError(502, "AI analysis returned invalid JSON");
        }
    }
};

const normalizeAnalysisPayload = (payload) =>
    analysisSchema.parse({
        resumeScore: normalizeScore(payload.resumeScore, "resumeScore"),
        atsScore: normalizeScore(payload.atsScore, "atsScore"),
        strengths: normalizeStringList(payload.strengths),
        weaknesses: normalizeStringList(payload.weaknesses),
        missingSkills: normalizeStringList(payload.missingSkills),
        grammarIssues: normalizeStringList(payload.grammarIssues),
        formattingIssues: normalizeStringList(payload.formattingIssues),
        improvementTips: normalizeStringList(payload.improvementTips),
        suggestedProjects: normalizeStringList(payload.suggestedProjects),
    });

const callAnalysisModel = async ({ resumeTitle, resumeText }) => {
    const { apiKey, model, baseUrl } = getAiConfig();

    const prompt = buildResumeAnalysisPrompt({
        resumeTitle,
        resumeText,
        isTruncated: resumeText.length >= MAX_ANALYSIS_TEXT_LENGTH,
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
        const errorMessage = payload?.error?.message || "Failed to generate resume analysis";
        throw new ApiError(502, errorMessage);
    }

    const content = payload?.choices?.[0]?.message?.content;
    const parsedPayload = extractJsonObject(content);

    return {
        model,
        analysis: normalizeAnalysisPayload(parsedPayload),
    };
};

const getResumeForAnalysis = async ({ userId, resumeId }) => {
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
        throw new ApiError(400, "Resume text is not available for analysis");
    }

    return resume;
};

const storeResumeAnalysis = async ({ resumeId, modelName, analysis }) => {
    return prisma.resumeAnalysis.upsert({
        where: { resumeId },
        create: {
            resumeId,
            modelName,
            ...analysis,
        },
        update: {
            modelName,
            ...analysis,
        },
        select: analysisSelect,
    });
};

export const analyzeResume = async ({ userId, resumeId }) => {
    const resume = await getResumeForAnalysis({ userId, resumeId });
    const resumeText = resume.parsedText.slice(0, MAX_ANALYSIS_TEXT_LENGTH);

    const { model, analysis } = await callAnalysisModel({
        resumeTitle: resume.title,
        resumeText,
    });

    return storeResumeAnalysis({
        resumeId: resume.id,
        modelName: model,
        analysis,
    });
};
