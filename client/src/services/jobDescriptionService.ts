import apiClient from "./apiClient";
import type { ApiResponse } from "./authService";

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  id: string;
  jobDescriptionId: string;
  resumeId: string;
  matchPercent: number;
  missingSkills: string[];
  missingKeywords: string[];
  resumeImprovements: string[];
  likelyInterviewTopics: string[];
  createdAt: string;
}

export const jobDescriptionService = {
  create: async (payload: {
    title: string;
    company: string;
    description: string;
    requiredSkills: string[];
  }): Promise<ApiResponse<{ jobDescription: JobDescription }>> => {
    return apiClient.post("/job-description", payload);
  },

  list: async (): Promise<ApiResponse<{ jobDescriptions: JobDescription[] }>> => {
    return apiClient.get("/job-description");
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/job-description/${id}`);
  },

  match: async (id: string, resumeId: string): Promise<ApiResponse<{ match: MatchResult }>> => {
    return apiClient.post(`/job-description/${id}/match`, { resumeId });
  },
};
