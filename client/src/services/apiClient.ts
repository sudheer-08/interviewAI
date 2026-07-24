import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — attach JWT to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — format errors and handle token expiration globally.
apiClient.interceptors.response.use(
  (response) => response.data, // Simplify data access in React Query
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "An unexpected error occurred.";
    const errors = error.response?.data?.errors || null;

    // On 401: clear the invalid token and notify the auth context.
    if (status === 401) {
      tokenStorage.clear();
      // Dispatch a custom event so AuthContext can reset state without
      // a circular import between apiClient ↔ AuthContext.
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    // Create custom error object
    const apiError = new Error(message) as any;
    apiError.status = status;
    apiError.errors = errors;
    apiError.rawError = error;

    return Promise.reject(apiError);
  }
);

export default apiClient;
