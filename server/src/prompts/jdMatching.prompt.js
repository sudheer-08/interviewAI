export const buildJobDescriptionMatchPrompt = ({
    jobTitle,
    company,
    jobDescription,
    requiredSkills,
    resumeTitle,
    resumeText,
    resumeTruncated,
    jobDescriptionTruncated,
}) => {
    const safeJobTitle = jobTitle?.trim() || "Untitled job description";
    const safeCompany = company?.trim() || "Unknown company";
    const skillsText = Array.isArray(requiredSkills) && requiredSkills.length > 0
        ? requiredSkills.map((skill) => `- ${String(skill).trim()}`).join("\n")
        : "- None provided";

    return {
        systemPrompt: [
            "You are a job description and resume matching engine for an ATS-focused hiring assistant.",
            "Analyze the provided resume against the provided job description and return only valid JSON.",
            "Do not include markdown, code fences, comments, or any prose outside the JSON object.",
            "matchPercent must be an integer from 0 to 100.",
            "All list fields must contain concise string items only.",
            "Use the following keys exactly: matchPercent, missingSkills, missingKeywords, resumeImprovements, likelyInterviewTopics.",
        ].join(" "),
        userPrompt: [
            `Job title: ${safeJobTitle}`,
            `Company: ${safeCompany}`,
            jobDescriptionTruncated ? "The job description text was truncated to fit the model context." : null,
            resumeTruncated ? "The resume text was truncated to fit the model context." : null,
            "Required skills:",
            skillsText,
            "Job description:",
            '"""',
            jobDescription,
            '"""',
            `Resume title: ${resumeTitle?.trim() || "Untitled resume"}`,
            "Resume text:",
            '"""',
            resumeText,
            '"""',
            "Return a JSON object with these fields:",
            "- matchPercent: number",
            "- missingSkills: string[]",
            "- missingKeywords: string[]",
            "- resumeImprovements: string[]",
            "- likelyInterviewTopics: string[]",
        ]
            .filter(Boolean)
            .join("\n"),
    };
};