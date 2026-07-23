import ApiError from "../utils/ApiError.js";

export const transcribeSpeech = async ({ audioFile, transcript }) => {
    if (transcript?.trim()) {
        return transcript.trim();
    }

    if (!audioFile?.buffer) {
        throw new ApiError(400, "Audio file or transcript text is required");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_STT_MODEL || "whisper-1";

    if (!apiKey) {
        throw new ApiError(500, "AI service is not configured");
    }

    const formData = new FormData();
    formData.append("model", model);
    formData.append("file", new Blob([audioFile.buffer], { type: audioFile.mimetype || "application/octet-stream" }), audioFile.originalname || "audio.webm");

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/audio/transcriptions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = payload?.error?.message || "Failed to transcribe speech";
        throw new ApiError(502, errorMessage);
    }

    const text = payload?.text?.trim();

    if (!text) {
        throw new ApiError(502, "Speech-to-text returned an empty transcript");
    }

    return text;
};