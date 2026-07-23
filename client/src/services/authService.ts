import apiClient from "./apiClient";

export interface User {
  id: string;
  fullName: string;
  email: string;
  profilePic?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
}

export const authService = {
  register: async (payload: any): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.post("/auth/register", payload);
  },

  login: async (payload: any): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.post("/auth/login", payload);
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get("/auth/me");
  },
};
