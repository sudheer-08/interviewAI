import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Missing token");
    }

    const token = authorizationHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new ApiError(500, "JWT secret is not configured");
    }

    try {
        // Verify the JWT and hydrate req.user for downstream handlers.
        const decoded = jwt.verify(token, secret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                fullName: true,
                email: true,
                profilePic: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new ApiError(401, "Unauthorized");
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired");
        }

        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid token");
        }

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(401, "Unauthorized");
    }
});

export default authMiddleware;