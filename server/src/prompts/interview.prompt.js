export const buildInterviewSessionPrompt = ({ role, experience, difficulty, language, interviewType, duration }) => {
    const safeRole = role?.trim() || "General";
    const safeExperience = experience?.trim() || "Mid-level";
    const safeDifficulty = difficulty?.trim() || "Medium";
    const safeLanguage = language?.trim() || "English";
    const safeInterviewType = interviewType?.trim() || "Technical";
    const safeDuration = duration?.trim() || "30 minutes";

    return {
        systemPrompt: [
            "You are an interview session planner for a hiring assistant.",
            "Create a structured interview session object, not just a list of questions.",
            "Return only valid JSON and no markdown or extra prose.",
            "Use the exact keys: introduction, interviewStrategy, difficultyProgression, currentQuestion, askedQuestions, remainingQuestions, conversationMemory, currentTopic, difficultyLevel, status, questions.",
            "The session must feel adaptive and progressive, not a flat list of 20 questions.",
            "questions should be a concise array sized appropriately for the selected duration and difficulty.",
            "The currentQuestion should be the first question in the sequence.",
            "askedQuestions should begin as an empty array.",
            "remainingQuestions should contain the unanswered question plan.",
            "conversationMemory should be a compact object that preserves interview context and progression cues.",
            "difficultyProgression should describe how the interview ramps up over time.",
            "difficultyLevel should reflect the starting difficulty or adaptive level.",
            "status should be one of draft, active, paused, or completed.",
        ].join(" "),
        userPrompt: [
            `Role: ${safeRole}`,
            `Experience: ${safeExperience}`,
            `Difficulty: ${safeDifficulty}`,
            `Language: ${safeLanguage}`,
            `Interview Type: ${safeInterviewType}`,
            `Duration: ${safeDuration}`,
            "Build an interview session object with these fields:",
            "- introduction: string",
            "- interviewStrategy: string",
            "- difficultyProgression: array or object describing how difficulty evolves",
            "- currentQuestion: string",
            "- askedQuestions: array of strings",
            "- remainingQuestions: array of strings",
            "- conversationMemory: object or array that tracks interview context",
            "- currentTopic: string",
            "- difficultyLevel: string",
            "- status: string",
            "- questions: array of objects with question, topic, and difficultyLevel",
            "Make the interview adaptive to the role, experience, and duration.",
            "Avoid output that looks like a flat question dump.",
        ].join("\n"),
    };
};