import { z } from "zod";
import prisma from "../config/prisma.js";
import { buildInterviewSessionPrompt } from "../prompts/interview.prompt.js";
import ApiError from "../utils/ApiError.js";
import { getAiConfig } from "../config/ai.js";

const sessionSelect = {
    id: true,
    userId: true,
    role: true,
    experience: true,
    difficulty: true,
    language: true,
    interviewType: true,
    duration: true,
    introduction: true,
    interviewStrategy: true,
    difficultyProgression: true,
    currentQuestion: true,
    askedQuestions: true,
    remainingQuestions: true,
    conversationMemory: true,
    currentTopic: true,
    difficultyLevel: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    questions: {
        orderBy: { order: "asc" },
    },
    answers: {
        orderBy: { createdAt: "asc" },
    },
};

const sessionPayloadSchema = z.object({
    introduction: z.string().trim().min(1),
    interviewStrategy: z.string().trim().min(1),
    difficultyProgression: z.unknown(),
    currentQuestion: z.string().trim().min(1),
    askedQuestions: z.array(z.string().trim().min(1)).default([]),
    remainingQuestions: z.array(z.string().trim().min(1)).default([]),
    conversationMemory: z.unknown(),
    currentTopic: z.string().trim().min(1),
    difficultyLevel: z.string().trim().min(1),
    status: z.string().trim().min(1),
    questions: z.array(
        z.object({
            question: z.string().trim().min(1),
            topic: z.string().trim().min(1).optional(),
            difficultyLevel: z.string().trim().min(1).optional(),
        })
    ).min(1),
});

const extractJsonObject = (content) => {
    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(502, "AI interview generator returned an empty response");
    }

    try {
        return JSON.parse(content);
    } catch {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new ApiError(502, "AI interview generator returned invalid JSON");
        }

        try {
            return JSON.parse(content.slice(firstBrace, lastBrace + 1));
        } catch {
            throw new ApiError(502, "AI interview generator returned invalid JSON");
        }
    }
};

const normalizeArray = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return [];
};

const callInterviewModel = async (payload) => {
    const { apiKey, model, baseUrl } = getAiConfig();
    const prompt = buildInterviewSessionPrompt(payload);

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

    const payloadData = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = payloadData?.error?.message || "Failed to generate interview session";
        throw new ApiError(502, errorMessage);
    }

    const content = payloadData?.choices?.[0]?.message?.content;
    const parsedPayload = extractJsonObject(content);
    const parsedSession = sessionPayloadSchema.parse({
        ...parsedPayload,
        askedQuestions: normalizeArray(parsedPayload.askedQuestions),
        remainingQuestions: normalizeArray(parsedPayload.remainingQuestions),
    });

    return {
        model,
        session: parsedSession,
    };
};

const createInterviewSessionRecord = async ({ userId, metadata, session, modelName }) => {
    return prisma.interviewSession.create({
        data: {
            userId,
            role: metadata.role,
            experience: metadata.experience,
            difficulty: metadata.difficulty,
            language: metadata.language,
            interviewType: metadata.interviewType,
            duration: metadata.duration,
            introduction: session.introduction,
            interviewStrategy: session.interviewStrategy,
            difficultyProgression: session.difficultyProgression,
            currentQuestion: session.currentQuestion,
            askedQuestions: session.askedQuestions,
            remainingQuestions: session.remainingQuestions,
            conversationMemory: session.conversationMemory,
            currentTopic: session.currentTopic,
            difficultyLevel: session.difficultyLevel,
            status: session.status,
            questions: {
                create: session.questions.map((question, index) => ({
                    order: index + 1,
                    topic: question.topic || null,
                    difficultyLevel: question.difficultyLevel || null,
                    question: question.question,
                    isCurrent: index === 0,
                    askedAt: null,
                })),
            },
        },
        select: {
            ...sessionSelect,
            questions: {
                orderBy: { order: "asc" },
            },
        },
    });
};

export const createInterview = async ({ userId, payload }) => {
    const { model, session } = await callInterviewModel(payload);

    const createdSession = await createInterviewSessionRecord({
        userId,
        metadata: payload,
        session,
        modelName: model,
    });

    return createdSession;
};
