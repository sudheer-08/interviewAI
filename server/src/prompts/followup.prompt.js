export const buildFollowUpPrompt = ({ session, memory, previousQuestion, previousAnswer, evaluation }) => {
    return {
        systemPrompt: [
            "You are a dynamic follow-up question generator for a voice interview.",
            "Return only valid JSON and no extra prose.",
            "Never repeat any previously asked question.",
            "Increase difficulty when the answer is weak or generic.",
            "Use previous answers to ask precise follow-ups.",
        ].join(" "),
        userPrompt: [
            `Role: ${session.role}`,
            `Experience: ${session.experience}`,
            `Difficulty: ${session.difficulty}`,
            `Language: ${session.language}`,
            `Interview Type: ${session.interviewType}`,
            `Current Topic: ${memory?.currentTopic || session.currentTopic || ""}`,
            `Previous Question: ${previousQuestion || memory?.previousQuestion || ""}`,
            `Previous Answer: ${previousAnswer || memory?.previousAnswer || ""}`,
            `Score: ${evaluation?.score ?? ""}`,
            `Strengths: ${(evaluation?.strengths || []).join(" | ")}`,
            `Weaknesses: ${(evaluation?.weaknesses || []).join(" | ")}`,
            `Asked Questions: ${(memory?.askedQuestions || []).join(" | ")}`,
            `Remaining Questions: ${(memory?.remainingQuestions || []).join(" | ")}`,
            `Conversation Summary: ${evaluation?.conversationSummary || memory?.conversationSummary || ""}`,
            "Return JSON with keys: followUpQuestion, currentTopic, difficultyLevel, remainingQuestions, conversationSummary, shouldContinue.",
            "followUpQuestion must be a new question that builds on the previous answer.",
        ].join("\n"),
    };
};