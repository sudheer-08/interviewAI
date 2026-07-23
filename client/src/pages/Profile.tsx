import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { User, Mail, Save, AlertCircle, Loader2 } from "lucide-react";

export const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const { showToast } = useNotification();
  
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  // Fetch Profile data
  const { data: profilePayload, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await profileService.getProfile();
      return res?.data?.profile || null;
    }
  });

  // Populate state on load
  useEffect(() => {
    if (profilePayload) {
      setFullName(profilePayload.fullName || "");
      setProfilePic(profilePayload.profilePic || "");
    }
  }, [profilePayload]);

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: { fullName: string; profilePic: string | null }) => {
      return profileService.updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshUser(); // Sync topnav branding
      showToast("Success", "Profile updated successfully!", "success");
    },
    onError: (err: any) => {
      showToast("Error", err.message || "Failed to update profile.", "error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Validation Error", "Full name cannot be empty.", "warning");
      return;
    }
    updateMutation.mutate({
      fullName,
      profilePic: profilePic.trim() ? profilePic.trim() : null
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (error || !profilePayload) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load profile data</h4>
          <p className="text-xs mt-0.5">Please check if the backend is running and database is active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          My Profile
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal details and account configurations.
        </p>
      </div>

      {/* Profile Form */}
      <div className="max-w-xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-indigo/10 dark:bg-accent-purple/10 flex items-center justify-center text-accent-indigo dark:text-accent-purple font-extrabold text-2xl border border-slate-200 dark:border-slate-700">
              {fullName.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-850 dark:text-white my-0">{profilePayload.fullName}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{profilePayload.email}</p>
            </div>
          </div>

          {/* Full name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>
          </div>

          {/* Email field (readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-650 dark:text-slate-500 uppercase tracking-wider">
              Email Address (Cannot change)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                readOnly
                value={profilePayload.email}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 outline-none text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-indigo hover:shadow-lg hover:shadow-accent-indigo/20 text-white font-semibold text-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Skeleton loader
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
  );
};

export default Profile;
