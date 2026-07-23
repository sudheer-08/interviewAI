import apiClient from "./apiClient";
import type { ApiResponse } from "./authService";

export interface DashboardData {
  totalInterviews: number;
  averageScore: number;
  hoursPracticed: number;
  currentStreak: number;
  averageTechnicalScore: number;
  averageCommunicationScore: number;
  mostImprovedSkill: string | null;
  weakestSkill: string | null;
  latestFeedback: string | null;
  upcomingLearningGoals: { skill: string; suggestion: string }[];
}

export interface WeeklyProgressItem {
  weekStart: string;
  weekEnd: string;
  interviewsCompleted: number;
  averageScore: number;
  technicalScore: number;
  communicationScore: number;
  practiceHours: number;
}

export interface MonthlyProgressItem {
  monthStart: string;
  monthLabel: string;
  interviewsCompleted: number;
  averageScore: number;
  technicalScore: number;
  communicationScore: number;
  practiceHours: number;
}

export interface TopicAccuracyItem {
  topic: string;
  interviewCount: number;
  averageScore: number;
  accuracy: number;
  growth: number;
  lastPracticedAt: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  role: string;
  interviewType: string;
  topic: string;
  score: number;
  technicalScore: number;
  communicationScore: number;
  practiceHours: number;
  status: string;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
}

export interface AnalyticsData {
  weeklyProgress: WeeklyProgressItem[];
  monthlyProgress: MonthlyProgressItem[];
  topicAccuracy: TopicAccuracyItem[];
  interviewHistory: HistoryItem[];
  skillGrowth: { date: string; value: number }[];
  communicationGrowth: { date: string; value: number }[];
  technicalGrowth: { date: string; value: number }[];
  practiceTime: {
    totalHours: number;
    series: { date: string; value: number }[];
  };
}

export const analyticsService = {
  getDashboard: async (): Promise<ApiResponse<{ dashboard: DashboardData }>> => {
    return apiClient.get("/dashboard");
  },

  getAnalytics: async (): Promise<ApiResponse<{ analytics: AnalyticsData }>> => {
    return apiClient.get("/analytics");
  },

  getProgress: async (): Promise<ApiResponse<{ progress: any }>> => {
    return apiClient.get("/analytics/progress");
  },

  getTopics: async (): Promise<ApiResponse<{ topics: any }>> => {
    return apiClient.get("/analytics/topics");
  },
};
