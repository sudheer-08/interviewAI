import ApiError from "../utils/ApiError.js";

export const synthesizeSpeech = async ({ text }) => {
    if (!text?.trim()) {
        throw new ApiError(400, "Text is required for speech synthesis");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_TTS_MODEL || "tts-1";
    const voice = process.env.OPENAI_TTS_VOICE || "alloy";

    if (!apiKey) {
        throw new ApiError(500, "AI service is not configured");
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/audio/speech`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            voice,
            input: text.trim(),
            response_format: "mp3",
        }),
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMessage = payload?.error?.message || "Failed to synthesize speech";
        throw new ApiError(502, errorMessage);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return {
        audioBuffer,
        mimeType: "audio/mpeg",
    };
};