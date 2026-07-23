import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enables cookie storage & headers (JWT in cookie or local storage)
});

// Response interceptor to format errors and handle token expiration
apiClient.interceptors.response.use(
  (response) => response.data, // Simplify data access in React Query
  (error) => {
    const message = error.response?.data?.message || "An unexpected error occurred.";
    const errors = error.response?.data?.errors || null;
    
    // Create custom error object
    const apiError = new Error(message) as any;
    apiError.status = error.response?.status;
    apiError.errors = errors;
    apiError.rawError = error;

    return Promise.reject(apiError);
  }
);

export default apiClient;
