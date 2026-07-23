export const buildResumeAnalysisPrompt = ({ resumeTitle, resumeText, isTruncated }) => {
    const resumeLabel = resumeTitle?.trim() || "Untitled resume";

    return {
        systemPrompt: [
            "You are a resume analysis engine for an ATS-focused hiring assistant.",
            "Analyze the resume and return only valid JSON.",
            "Do not include markdown, code fences, comments, or any prose outside the JSON object.",
            "All scores must be integers from 0 to 100.",
            "All list fields must contain concise string items only.",
            "Use the following keys exactly: resumeScore, atsScore, strengths, weaknesses, missingSkills, grammarIssues, formattingIssues, improvementTips, suggestedProjects.",
        ].join(" "),
        userPrompt: [
            `Resume title: ${resumeLabel}`,
            isTruncated ? "The resume text was truncated to fit the model context." : null,
            "Return a JSON object with these fields:",
            "- resumeScore: number",
            "- atsScore: number",
            "- strengths: string[]",
            "- weaknesses: string[]",
            "- missingSkills: string[]",
            "- grammarIssues: string[]",
            "- formattingIssues: string[]",
            "- improvementTips: string[]",
            "- suggestedProjects: string[]",
            "Resume text:",
            '"""',
            resumeText,
            '"""',
        ]
            .filter(Boolean)
            .join("\n"),
    };
};