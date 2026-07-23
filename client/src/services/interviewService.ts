import apiClient from "./apiClient";
import type { ApiResponse } from "./authService";

export interface InterviewSession {
  id: string;
  role: string;
  experience: string;
  difficulty: string;
  language: string;
  interviewType: string;
  duration: string;
  status: string;
  currentQuestion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackData {
  id: string;
  sequence: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  followUpQuestion?: string;
  currentTopic?: string;
  difficultyLevel?: string;
  conversationSummary: string;
}

export interface StartResponse {
  interviewSession: InterviewSession;
  currentQuestion: string;
}

export interface AnswerResponse {
  interviewSession: InterviewSession;
  feedback: FeedbackData;
  followUp: {
    question: string;
  };
}

export interface EndResponse {
  interviewSession: InterviewSession;
  summary: string;
  nextSteps: string;
}

export interface TranscriptItem {
  id: string;
  speaker: "candidate" | "interviewer" | "system";
  turnType: string;
  sequence: number;
  content: string;
  createdAt: string;
}

export const interviewService = {
  create: async (payload: {
    role: string;
    experience: string;
    difficulty: string;
    language: string;
    interviewType: string;
    duration: number | string;
  }): Promise<ApiResponse<{ interview: InterviewSession }>> => {
    return apiClient.post("/interview/create", payload);
  },

  start: async (id: string): Promise<ApiResponse<StartResponse>> => {
    return apiClient.post(`/interview/${id}/start`);
  },

  submitAnswer: async (
    id: string,
    payload: {
      audioBlob?: Blob | null;
      transcript: string;
      durationSeconds: number;
    }
  ): Promise<ApiResponse<AnswerResponse>> => {
    const formData = new FormData();
    if (payload.audioBlob) {
      formData.append("audio", payload.audioBlob, "recording.webm");
    }
    formData.append("transcript", payload.transcript);
    formData.append("durationSeconds", String(payload.durationSeconds));

    return apiClient.post(`/interview/${id}/answer`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  end: async (id: string): Promise<ApiResponse<EndResponse>> => {
    return apiClient.post(`/interview/${id}/end`);
  },

  getTranscript: async (id: string): Promise<ApiResponse<{ 
    interviewSession: InterviewSession;
    transcripts: TranscriptItem[];
    recordings: Array<Record<string, unknown>>;
    feedbacks: FeedbackData[];
  }>> => {
    return apiClient.get(`/interview/${id}/transcript`);
  },
};
