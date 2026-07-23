export const buildEvaluationPrompt = ({ session, memory, previousQuestion, previousAnswer, transcriptText }) => {
    return {
        systemPrompt: [
            "You are an interview answer evaluator.",
            "Return only valid JSON and no extra prose.",
            "Never ask the full transcript; use the supplied memory only.",
            "Challenge weak answers, score technical depth, clarity, and relevance.",
        ].join(" "),
        userPrompt: [
            `Role: ${session.role}`,
            `Experience: ${session.experience}`,
            `Difficulty: ${session.difficulty}`,
            `Language: ${session.language}`,
            `Interview Type: ${session.interviewType}`,
            `Current Topic: ${memory?.currentTopic || session.currentTopic || ""}`,
            `Previous Question: ${previousQuestion || memory?.previousQuestion || ""}`,
            `Previous Answer: ${previousAnswer || transcriptText || memory?.previousAnswer || ""}`,
            `Conversation Summary: ${memory?.conversationSummary || ""}`,
            `Asked Questions: ${(memory?.askedQuestions || []).join(" | ")}`,
            `Remaining Questions: ${(memory?.remainingQuestions || []).join(" | ")}`,
            "Return JSON with keys: score, strengths, weaknesses, improvementTips, conversationSummary, currentTopic, difficultyLevel, needsFollowUp.",
            "score must be an integer from 0 to 100.",
            "weaknesses should describe what was missing or weak in the answer.",
        ].join("\n"),
    };
};