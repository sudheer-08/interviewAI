export const buildConversationPrompt = ({ mode, session, memory, currentQuestion, previousQuestion, previousAnswer }) => {
    const safeMode = mode === "end" ? "end" : "start";

    return {
        systemPrompt: [
            "You are a voice interview assistant that manages session openings and closings.",
            "Return only valid JSON and no extra prose.",
            "Do not reveal or request the full transcript; use compact memory only.",
            "If mode is start, produce a natural spoken introduction and the first question.",
            "If mode is end, produce a natural closing and concise summary.",
        ].join(" "),
        userPrompt: [
            `Mode: ${safeMode}`,
            `Role: ${session.role}`,
            `Experience: ${session.experience}`,
            `Difficulty: ${session.difficulty}`,
            `Language: ${session.language}`,
            `Interview Type: ${session.interviewType}`,
            `Duration: ${session.duration}`,
            `Current Question: ${currentQuestion || session.currentQuestion || ""}`,
            `Previous Question: ${previousQuestion || memory?.previousQuestion || ""}`,
            `Previous Answer: ${previousAnswer || memory?.previousAnswer || ""}`,
            `Conversation Memory: ${JSON.stringify(memory || {})}`,
            safeMode === "start"
                ? [
                    "Return JSON with keys: spokenIntroduction, spokenQuestion, currentTopic, difficultyLevel, conversationSummary, status.",
                    "spokenQuestion must be short and should not change the meaning of the current question.",
                ].join(" ")
                : [
                    "Return JSON with keys: spokenClosing, conversationSummary, nextSteps, status.",
                    "Keep the closing concise, professional, and actionable.",
                ].join(" "),
        ].join("\n"),
    };
};