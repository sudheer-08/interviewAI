import { z } from "zod";
import ApiError from "../utils/ApiError.js";
import { getAiConfig } from "../config/ai.js";
import { buildEvaluationPrompt } from "../prompts/evaluation.prompt.js";

const evaluationSchema = z.object({
    score: z.number().int().min(0).max(100),
    strengths: z.array(z.string().trim().min(1)).default([]),
    weaknesses: z.array(z.string().trim().min(1)).default([]),
    improvementTips: z.array(z.string().trim().min(1)).default([]),
    conversationSummary: z.string().trim().min(1),
    currentTopic: z.string().trim().min(1),
    difficultyLevel: z.string().trim().min(1),
    needsFollowUp: z.boolean().default(true),
});

const extractJsonObject = (content) => {
    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(502, "Evaluation model returned an empty response");
    }

    try {
        return JSON.parse(content);
    } catch {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new ApiError(502, "Evaluation model returned invalid JSON");
        }

        try {
            return JSON.parse(content.slice(firstBrace, lastBrace + 1));
        } catch {
            throw new ApiError(502, "Evaluation model returned invalid JSON");
        }
    }
};

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return [];
};

const normalizeScore = (value) => {
    const score = Number(value);

    if (!Number.isFinite(score)) {
        throw new ApiError(502, "Evaluation model returned an invalid score");
    }

    return Math.max(0, Math.min(100, Math.round(score)));
};

const getOpenAiConfig = () => {
    const { apiKey, model, baseUrl } = getAiConfig();

    return { apiKey, model, baseUrl };
};

export const evaluateAnswer = async ({ session, memory, previousQuestion, previousAnswer, transcriptText }) => {
    const { apiKey, model, baseUrl } = getOpenAiConfig();
    const prompt = buildEvaluationPrompt({
        session,
        memory,
        previousQuestion,
        previousAnswer,
        transcriptText,
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
        const errorMessage = payload?.error?.message || "Failed to evaluate answer";
        throw new ApiError(502, errorMessage);
    }

    const content = payload?.choices?.[0]?.message?.content;
    const parsedPayload = extractJsonObject(content);

    return evaluationSchema.parse({
        score: normalizeScore(parsedPayload.score),
        strengths: normalizeList(parsedPayload.strengths),
        weaknesses: normalizeList(parsedPayload.weaknesses),
        improvementTips: normalizeList(parsedPayload.improvementTips),
        conversationSummary: String(parsedPayload.conversationSummary || "").trim(),
        currentTopic: String(parsedPayload.currentTopic || memory?.currentTopic || session.currentTopic || "").trim(),
        difficultyLevel: String(parsedPayload.difficultyLevel || session.difficultyLevel || session.difficulty || "").trim(),
        needsFollowUp: Boolean(parsedPayload.needsFollowUp),
    });
};
