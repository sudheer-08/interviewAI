import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService";
import type { User } from "../services/authService";
import { tokenStorage } from "../services/tokenStorage";
import { useNotification } from "./NotificationContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const refreshUser = useCallback(async () => {
    // Only call /auth/me when a token is actually stored — avoids an
    // unconditional 401 on first load when the user is not logged in.
    if (!tokenStorage.get()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
        tokenStorage.clear();
      }
    } catch (error) {
      setUser(null);
      tokenStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Listen for the global 401 event dispatched by the Axios response interceptor.
  // This handles token expiry or invalidation in any API call, not just auth calls.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (payload: any) => {
    setLoading(true);
    try {
      const response = await authService.login(payload);
      if (response.success && response.data?.user) {
        // Save the JWT so every subsequent request can attach it.
        if (response.data.token) {
          tokenStorage.set(response.data.token);
        }
        setUser(response.data.user);
        showToast("Success", "Welcome back to AI Interview Platform!", "success");
      }
    } catch (error: any) {
      const msg = error.message || "Failed to log in.";
      showToast("Authentication Failed", msg, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      const response = await authService.register(payload);
      if (response.success && response.data?.user) {
        // Save the JWT returned on registration too.
        if (response.data.token) {
          tokenStorage.set(response.data.token);
        }
        setUser(response.data.user);
        showToast("Registration Successful", "Your account has been created!", "success");
      }
    } catch (error: any) {
      const msg = error.message || "Registration failed.";
      showToast("Registration Error", msg, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
      // Best-effort — proceed with local cleanup even if the server call fails.
    } finally {
      tokenStorage.clear();
      setUser(null);
      setLoading(false);
      showToast("Logged Out", "You have been securely logged out.", "success");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
