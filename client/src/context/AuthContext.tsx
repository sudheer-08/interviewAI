import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService";
import type { User } from "../services/authService";
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
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: any) => {
    setLoading(true);
    try {
      const response = await authService.login(payload);
      if (response.success && response.data?.user) {
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
      setUser(null);
      showToast("Logged Out", "You have been securely logged out.", "success");
    } catch (error: any) {
      // In case of cookie issues, clear user local state anyway
      setUser(null);
      showToast("Logged Out", "Session ended.", "success");
    } finally {
      setLoading(false);
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
