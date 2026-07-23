import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const userSelect = {
    id: true,
    fullName: true,
    email: true,
    profilePic: true,
    createdAt: true,
    updatedAt: true,
};

const getJwtConfig = () => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    if (!secret) {
        throw new ApiError(500, "JWT secret is not configured");
    }

    return { secret, expiresIn };
};

const generateToken = (userId) => {
    const { secret, expiresIn } = getJwtConfig();
    return jwt.sign({ id: userId }, secret, { expiresIn });
};

const sanitizeUser = (user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const registerUser = async ({ fullName, email, password }) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    // Store only a hashed password, never the raw credential.
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
            },
            select: userSelect,
        });

        // Return a token immediately so the client can establish the session.
        const token = generateToken(user.id);

        return {
            user,
            token,
        };
    } catch (error) {
        if (error.code === "P2002") {
            throw new ApiError(409, "Email already exists");
        }

        throw error;
    }
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user.id);

    return {
        user: sanitizeUser(user),
        token,
    };
};

export const getCurrentUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect,
    });

    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    return user;
};