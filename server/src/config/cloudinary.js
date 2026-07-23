import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";

let isConfigured = false;

/**
 * Lazily configures Cloudinary so the server can boot even when
 * resume upload credentials are not yet set in the environment.
 */
const ensureCloudinaryConfigured = () => {
    if (isConfigured) {
        return cloudinary;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new ApiError(500, "Cloudinary credentials are not configured");
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    isConfigured = true;
    return cloudinary;
};

export default ensureCloudinaryConfigured;
