import apiClient from "./apiClient";
import type { ApiResponse, User } from "./authService";

export interface Settings {
  id: string;
  preferredLanguage: string;
  preferredAiVoice: string;
  theme: "system" | "light" | "dark";
  interviewDuration: number;
  notificationPreferences: Record<string, any>;
  dailyGoal: number;
  weeklyGoal: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const profileService = {
  getProfile: async (): Promise<ApiResponse<{ profile: User }>> => {
    return apiClient.get("/profile");
  },

  updateProfile: async (payload: { fullName?: string; profilePic?: string | null }): Promise<ApiResponse<{ profile: User }>> => {
    return apiClient.put("/profile", payload);
  },

  getSettings: async (): Promise<ApiResponse<{ settings: Settings }>> => {
    return apiClient.get("/settings");
  },

  updateSettings: async (payload: Partial<Settings>): Promise<ApiResponse<{ settings: Settings }>> => {
    return apiClient.put("/settings", payload);
  },

  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    return apiClient.get("/notifications");
  },

  markNotificationsRead: async (notificationIds: string[]): Promise<ApiResponse<Notification[]>> => {
    return apiClient.put("/notifications/read", { notificationIds });
  },

  deleteNotification: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/notifications/${id}`);
  },
};
