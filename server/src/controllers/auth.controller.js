import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getCurrentUserById, loginUser, registerUser } from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    const { user, token } = await registerUser({ fullName, email, password });

    return res.status(201).json(new ApiResponse(201, "User registered successfully", { user, token }));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });

    return res.status(200).json(new ApiResponse(200, "Login successful", { user, token }));
});

export const me = asyncHandler(async (req, res) => {
    const user = await getCurrentUserById(req.user.id);

    return res.status(200).json(new ApiResponse(200, "Current user fetched successfully", { user }));
});

export const logout = asyncHandler(async (_req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
    });

    return res.status(200).json(new ApiResponse(200, "Logout successful"));
});