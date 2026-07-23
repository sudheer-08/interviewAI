import apiClient from "./apiClient";
import type { ApiResponse } from "./authService";

export interface Resume {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysisResult {
  id: string;
  resumeId: string;
  resumeScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  grammarIssues: string[];
  formattingIssues: string[];
  improvementTips: string[];
  suggestedProjects: string[];
  createdAt: string;
}

export const resumeService = {
  upload: async (file: File, title: string): Promise<ApiResponse<{ resume: Resume }>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    return apiClient.post("/resume/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  list: async (): Promise<ApiResponse<{ resumes: Resume[] }>> => {
    return apiClient.get("/resume");
  },

  getById: async (id: string): Promise<ApiResponse<{ resume: Resume & { analysis?: ResumeAnalysisResult | null } }>> => {
    return apiClient.get(`/resume/${id}`);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/resume/${id}`);
  },

  analyze: async (id: string): Promise<ApiResponse<{ analysis: ResumeAnalysisResult }>> => {
    return apiClient.post(`/resume/${id}/analyze`);
  },
};
