import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Maximum allowed resume upload size: 5 MB.
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Multer memory storage keeps the PDF in RAM as a Buffer,
 * which is required for both Cloudinary upload and PDF text parsing.
 */
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, callback) => {
        // Accept only PDF MIME type to prevent unsupported file uploads.
        if (file.mimetype === "application/pdf") {
            callback(null, true);
            return;
        }

        callback(new Error("Only PDF files are allowed"));
    },
});

/**
 * Wraps multer.single so upload errors are converted into ApiError responses.
 * Also ensures a file was actually attached to the request.
 */
export const uploadResumePdf = (req, res, next) => {
    upload.single("file")(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    return next(new ApiError(400, "File size must not exceed 5MB"));
                }

                return next(new ApiError(400, error.message));
            }

            return next(new ApiError(400, error.message));
        }

        if (!req.file) {
            return next(new ApiError(400, "PDF file is required"));
        }

        return next();
    });
};

const interviewAudioStorage = multer.memoryStorage();

const interviewAudioUpload = multer({
    storage: interviewAudioStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith("audio/") || file.mimetype === "video/webm") {
            callback(null, true);
            return;
        }

        callback(new Error("Only audio files are allowed"));
    },
});

export const uploadInterviewAudio = (req, res, next) => {
    interviewAudioUpload.single("audio")(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    return next(new ApiError(400, "Audio file size must not exceed 25MB"));
                }

                return next(new ApiError(400, error.message));
            }

            return next(new ApiError(400, error.message));
        }

        return next();
    });
};
