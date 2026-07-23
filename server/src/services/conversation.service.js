import prisma from "../config/prisma.js";
import ensureCloudinaryConfigured from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import { buildConversationPrompt } from "../prompts/conversation.prompt.js";
import { evaluateAnswer } from "../services/evaluation.service.js";
import { generateFollowUpQuestion } from "../services/followup.service.js";
import { transcribeSpeech } from "../services/speech.service.js";
import { getAiConfig } from "../config/ai.js";

const interviewSessionSelect = {
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
};

const transcriptSelect = {
    id: true,
    interviewSessionId: true,
    speaker: true,
    turnType: true,
    sequence: true,
    content: true,
    transcriptText: true,
    topic: true,
    difficultyLevel: true,
    createdAt: true,
    updatedAt: true,
};

const recordingSelect = {
    id: true,
    interviewSessionId: true,
    sequence: true,
    kind: true,
    fileUrl: true,
    publicId: true,
    mimeType: true,
    durationSeconds: true,
    createdAt: true,
    updatedAt: true,
};

const feedbackSelect = {
    id: true,
    interviewSessionId: true,
    sequence: true,
    modelName: true,
    score: true,
    strengths: true,
    weaknesses: true,
    improvementTips: true,
    followUpQuestion: true,
    currentTopic: true,
    difficultyLevel: true,
    conversationSummary: true,
    createdAt: true,
    updatedAt: true,
};

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return [];
};

const normalizeText = (value) => String(value || "").trim();

const getCloudinary = () => ensureCloudinaryConfigured();

const uploadAudioBuffer = async ({ buffer, filename, mimeType, folder }) => {
    const cloudinary = getCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "raw",
                public_id: filename,
            },
            (error, result) => {
                if (error) {
                    reject(new ApiError(500, "Failed to store interview audio"));
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

const getInterviewSession = async ({ userId, interviewId }) => {
    const interviewSession = await prisma.interviewSession.findFirst({
        where: {
            id: interviewId,
            userId,
        },
        select: interviewSessionSelect,
    });

    if (!interviewSession) {
        throw new ApiError(404, "Interview session not found");
    }

    return interviewSession;
};

const getNextSequence = async (interviewSessionId) => {
    const count = await prisma.transcript.count({ where: { interviewSessionId } });
    return count + 1;
};

const buildMemorySnapshot = (session, patch = {}) => {
    const conversationMemory = typeof session.conversationMemory === "object" && session.conversationMemory !== null
        ? session.conversationMemory
        : {};

    return {
        resumeSummary: conversationMemory.resumeSummary || "",
        jobDescriptionSummary: conversationMemory.jobDescriptionSummary || "",
        currentTopic: patch.currentTopic || conversationMemory.currentTopic || session.currentTopic || "",
        previousQuestion: patch.previousQuestion || conversationMemory.previousQuestion || "",
        previousAnswer: patch.previousAnswer || conversationMemory.previousAnswer || "",
        conversationSummary: patch.conversationSummary || conversationMemory.conversationSummary || "",
        askedQuestions: normalizeList(conversationMemory.askedQuestions || session.askedQuestions),
        remainingQuestions: normalizeList(conversationMemory.remainingQuestions || session.remainingQuestions),
    };
};

const updateInterviewMemory = async ({ session, patch }) => {
    const nextMemory = buildMemorySnapshot(session, patch);

    return prisma.interviewSession.update({
        where: { id: session.id },
        data: {
            currentQuestion: patch.currentQuestion ?? session.currentQuestion,
            currentTopic: patch.currentTopic ?? session.currentTopic,
            difficultyLevel: patch.difficultyLevel ?? session.difficultyLevel,
            status: patch.status ?? session.status,
            askedQuestions: patch.askedQuestions ?? session.askedQuestions,
            remainingQuestions: patch.remainingQuestions ?? session.remainingQuestions,
            conversationMemory: nextMemory,
        },
        select: interviewSessionSelect,
    });
};

const parseSessionQuestions = (session) => session.questions || [];

const getNextQuestion = (session) => session.currentQuestion || parseSessionQuestions(session)[0]?.question || null;

const createTranscript = async ({ interviewSessionId, speaker, turnType, sequence, content, transcriptText, topic, difficultyLevel }) => {
    return prisma.transcript.create({
        data: {
            interviewSessionId,
            speaker,
            turnType,
            sequence,
            content,
            transcriptText: transcriptText || null,
            topic: topic || null,
            difficultyLevel: difficultyLevel || null,
        },
        select: transcriptSelect,
    });
};

const createRecording = async ({ interviewSessionId, sequence, kind, buffer, mimeType, filename, durationSeconds }) => {
    const uploaded = await uploadAudioBuffer({
        buffer,
        filename,
        mimeType,
        folder: "interview-ai/interview-recordings",
    });

    return prisma.recording.create({
        data: {
            interviewSessionId,
            sequence,
            kind,
            fileUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
            mimeType: mimeType || "audio/mpeg",
            durationSeconds: durationSeconds ?? null,
        },
        select: recordingSelect,
    });
};

const createFeedback = async ({ interviewSessionId, sequence, modelName, evaluation, followUpQuestion }) => {
    return prisma.feedback.create({
        data: {
            interviewSessionId,
            sequence,
            modelName,
            score: evaluation.score,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            improvementTips: evaluation.improvementTips,
            followUpQuestion,
            currentTopic: evaluation.currentTopic,
            difficultyLevel: evaluation.difficultyLevel,
            conversationSummary: evaluation.conversationSummary,
        },
        select: feedbackSelect,
    });
};

const buildConversationSpeech = async ({ mode, session, memory, currentQuestion, previousQuestion, previousAnswer }) => {
    const prompt = buildConversationPrompt({
        mode,
        session,
        memory,
        currentQuestion,
        previousQuestion,
        previousAnswer,
    });

    const { apiKey, model, baseUrl } = getAiConfig();

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
        const errorMessage = payload?.error?.message || "Failed to generate interview speech";
        throw new ApiError(502, errorMessage);
    }

    const content = payload?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
        spokenIntroduction: normalizeText(parsed.spokenIntroduction),
        spokenQuestion: normalizeText(parsed.spokenQuestion),
        spokenClosing: normalizeText(parsed.spokenClosing),
        conversationSummary: normalizeText(parsed.conversationSummary),
        currentTopic: normalizeText(parsed.currentTopic),
        difficultyLevel: normalizeText(parsed.difficultyLevel),
        nextSteps: normalizeText(parsed.nextSteps),
        status: normalizeText(parsed.status),
    };
};

const transcribeAndStoreCandidateAnswer = async ({ session, transcriptText, audioFile, durationSeconds }) => {
    const answerText = await transcribeSpeech({
        audioFile,
        transcript: transcriptText,
    });

    const sequence = await getNextSequence(session.id);
    const transcript = await createTranscript({
        interviewSessionId: session.id,
        speaker: "candidate",
        turnType: "answer",
        sequence,
        content: answerText,
        transcriptText: answerText,
        topic: session.currentTopic || null,
        difficultyLevel: session.difficultyLevel || null,
    });

    let recording = null;

    if (audioFile?.buffer) {
        recording = await createRecording({
            interviewSessionId: session.id,
            sequence,
            kind: "candidate-answer",
            buffer: audioFile.buffer,
            mimeType: audioFile.mimetype,
            filename: `candidate-answer-${session.id}-${sequence}`,
            durationSeconds,
        });
    }

    return { answerText, transcript, recording, sequence };
};

export const startInterviewConversation = async ({ userId, interviewId }) => {
    const session = await getInterviewSession({ userId, interviewId });
    const currentQuestion = getNextQuestion(session);

    if (session.status === "completed") {
        throw new ApiError(400, "This interview session has already been completed");
    }

    if (!currentQuestion) {
        throw new ApiError(400, "Interview session does not have any prepared questions");
    }

    // Reloading the interview room must not create a duplicate opening question.
    if (session.status === "active") {
        return {
            interviewSession: session,
            transcript: null,
            recording: null,
            spokenIntroduction: "",
            currentQuestion,
        };
    }

    const memory = buildMemorySnapshot(session, { currentQuestion });
    const speech = await buildConversationSpeech({
        mode: "start",
        session,
        memory,
        currentQuestion,
    });

    const spokenQuestion = speech.spokenQuestion || currentQuestion;
    const spokenIntroduction = speech.spokenIntroduction || session.introduction;
    const spokenText = [spokenIntroduction, spokenQuestion].filter(Boolean).join("\n\n");

    const sequence = await getNextSequence(session.id);
    const transcript = await createTranscript({
        interviewSessionId: session.id,
        speaker: "ai",
        turnType: "question",
        sequence,
        content: spokenText,
        transcriptText: spokenQuestion,
        topic: speech.currentTopic || session.currentTopic || null,
        difficultyLevel: speech.difficultyLevel || session.difficultyLevel || null,
    });

    const updatedSession = await updateInterviewMemory({
        session,
        patch: {
            status: "active",
            currentQuestion: currentQuestion,
            currentTopic: speech.currentTopic || session.currentTopic || memory.currentTopic,
        },
    });

    return {
        interviewSession: updatedSession,
        transcript,
        recording: null,
        spokenIntroduction,
        currentQuestion,
    };
};

export const answerInterviewConversation = async ({ userId, interviewId, audioFile, transcriptText, durationSeconds }) => {
    const session = await getInterviewSession({ userId, interviewId });

    if (session.status === "completed") {
        throw new ApiError(400, "This interview session has already been completed");
    }

    const previousQuestion = getNextQuestion(session);

    if (!previousQuestion) {
        throw new ApiError(400, "Interview session does not have a current question to answer");
    }

    const { answerText, transcript, recording, sequence: answerSequence } = await transcribeAndStoreCandidateAnswer({
        session,
        transcriptText,
        audioFile,
        durationSeconds,
    });

    const memory = buildMemorySnapshot(session, {
        previousQuestion,
        previousAnswer: answerText,
        currentQuestion: previousQuestion,
    });

    const evaluation = await evaluateAnswer({
        session,
        memory,
        previousQuestion,
        previousAnswer: answerText,
        transcriptText: answerText,
    });

    const followUp = await generateFollowUpQuestion({
        session,
        memory,
        previousQuestion,
        previousAnswer: answerText,
        evaluation,
    });

    const nextMemory = buildMemorySnapshot(session, {
        currentTopic: followUp.currentTopic || evaluation.currentTopic || session.currentTopic || memory.currentTopic,
        previousQuestion,
        previousAnswer: answerText,
        conversationSummary: followUp.conversationSummary || evaluation.conversationSummary,
    });

    // Keep only compact memory so we never resend the full transcript history.
    const askedQuestions = Array.from(new Set([...(memory.askedQuestions || []), previousQuestion].filter(Boolean)));
    const remainingQuestions = Array.from(
        new Set(
            normalizeList(followUp.remainingQuestions.length ? followUp.remainingQuestions : memory.remainingQuestions)
                .filter((question) => question && question !== previousQuestion)
        )
    );

    const aiSequence = answerSequence + 1;
    const followUpTranscript = await createTranscript({
        interviewSessionId: session.id,
        speaker: "ai",
        turnType: "followup",
        sequence: aiSequence,
        content: followUp.followUpQuestion,
        transcriptText: followUp.followUpQuestion,
        topic: followUp.currentTopic || evaluation.currentTopic || session.currentTopic || null,
        difficultyLevel: followUp.difficultyLevel || evaluation.difficultyLevel || session.difficultyLevel || null,
    });

    const feedback = await createFeedback({
        interviewSessionId: session.id,
        sequence: answerSequence,
        modelName: getAiConfig().model,
        evaluation,
        followUpQuestion: followUp.followUpQuestion,
    });

    const updatedSession = await updateInterviewMemory({
        session,
        patch: {
            status: "active",
            currentQuestion: followUp.followUpQuestion,
            currentTopic: followUp.currentTopic || evaluation.currentTopic || session.currentTopic,
            difficultyLevel: followUp.difficultyLevel || evaluation.difficultyLevel || session.difficultyLevel,
            askedQuestions,
            remainingQuestions,
            conversationSummary: nextMemory.conversationSummary,
        },
    });

    return {
        interviewSession: updatedSession,
        candidate: {
            transcript,
            recording,
            answerText,
        },
        evaluation,
        feedback,
        followUp: {
            transcript: followUpTranscript,
            recording: null,
            question: followUp.followUpQuestion,
        },
    };
};

export const endInterviewConversation = async ({ userId, interviewId }) => {
    const session = await getInterviewSession({ userId, interviewId });

    if (session.status === "completed") {
        return {
            interviewSession: session,
            transcript: null,
            recording: null,
            summary: buildMemorySnapshot(session).conversationSummary,
            nextSteps: "",
        };
    }

    const memory = buildMemorySnapshot(session);
    const currentQuestion = getNextQuestion(session);

    const speech = await buildConversationSpeech({
        mode: "end",
        session,
        memory,
        currentQuestion,
    });

    const closingText = speech.spokenClosing || "Thank you for taking the interview.";
    const sequence = await getNextSequence(session.id);

    const transcript = await createTranscript({
        interviewSessionId: session.id,
        speaker: "ai",
        turnType: "end",
        sequence,
        content: closingText,
        transcriptText: closingText,
        topic: session.currentTopic || null,
        difficultyLevel: session.difficultyLevel || null,
    });

    const updatedSession = await updateInterviewMemory({
        session,
        patch: {
            status: "completed",
            conversationSummary: speech.conversationSummary || memory.conversationSummary,
        },
    });

    return {
        interviewSession: updatedSession,
        transcript,
        recording: null,
        summary: speech.conversationSummary || memory.conversationSummary,
        nextSteps: speech.nextSteps || "",
    };
};

export const getInterviewConversationTranscript = async ({ userId, interviewId }) => {
    const session = await getInterviewSession({ userId, interviewId });

    const [transcripts, recordings, feedbacks] = await Promise.all([
        prisma.transcript.findMany({
            where: { interviewSessionId: session.id },
            orderBy: { sequence: "asc" },
            select: transcriptSelect,
        }),
        prisma.recording.findMany({
            where: { interviewSessionId: session.id },
            orderBy: { sequence: "asc" },
            select: recordingSelect,
        }),
        prisma.feedback.findMany({
            where: { interviewSessionId: session.id },
            orderBy: { sequence: "asc" },
            select: feedbackSelect,
        }),
    ]);

    return {
        interviewSession: session,
        transcripts,
        recordings,
        feedbacks,
    };
};
