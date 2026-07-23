import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profileService";
import type { Settings as UserSettings } from "../services/profileService";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { Save, AlertCircle, Loader2, Settings as SettingsIcon } from "lucide-react";

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const { setTheme: setThemeContext } = useTheme();
  const { showToast } = useNotification();

  // Settings State
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [preferredAiVoice, setPreferredAiVoice] = useState("default");
  const [themeState, setThemeState] = useState<"system" | "light" | "dark">("system");
  const [interviewDuration, setInterviewDuration] = useState(30);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [weeklyGoal, setWeeklyGoal] = useState(5);

  // Fetch settings from API
  const { data: settingsPayload, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await profileService.getSettings();
      return res?.data?.settings || null;
    }
  });

  // Populate state on load
  useEffect(() => {
    if (settingsPayload) {
      setPreferredLanguage(settingsPayload.preferredLanguage || "English");
      setPreferredAiVoice(settingsPayload.preferredAiVoice || "default");
      setThemeState(settingsPayload.theme || "system");
      setInterviewDuration(Number(settingsPayload.interviewDuration) || 30);
      setDailyGoal(Number(settingsPayload.dailyGoal) || 1);
      setWeeklyGoal(Number(settingsPayload.weeklyGoal) || 5);
    }
  }, [settingsPayload]);

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<UserSettings>) => {
      return profileService.updateSettings(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      
      const newTheme = res?.data?.settings?.theme || "system";
      setThemeContext(newTheme as any); // Update ThemeContext state to apply styles instantly
      
      showToast("Success", "Settings saved and theme applied!", "success");
    },
    onError: (err: any) => {
      showToast("Error", err.message || "Failed to save settings.", "error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      preferredLanguage,
      preferredAiVoice,
      theme: themeState,
      interviewDuration,
      dailyGoal,
      weeklyGoal,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !settingsPayload) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load platform settings</h4>
          <p className="text-xs mt-0.5">Please ensure the backend database is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          Platform Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure preferred language voices, global themes, and mock target durations.
        </p>
      </div>

      {/* Form panel */}
      <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Coach Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              >
                <option value="English">English (US/UK)</option>
                <option value="Spanish">Spanish (ES)</option>
                <option value="French">French (FR)</option>
                <option value="German">German (DE)</option>
              </select>
            </div>

            {/* AI voice select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                AI Voice profile
              </label>
              <select
                value={preferredAiVoice}
                onChange={(e) => setPreferredAiVoice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              >
                <option value="default">Default System voice</option>
                <option value="alloy">Alloy (Warm)</option>
                <option value="echo">Echo (Balanced)</option>
                <option value="fable">Fable (Expressive)</option>
                <option value="onyx">Onyx (Deep)</option>
                <option value="nova">Nova (Bright)</option>
                <option value="shimmer">Shimmer (Professional)</option>
              </select>
            </div>

            {/* Platform Theme */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Theme preference
              </label>
              <select
                value={themeState}
                onChange={(e) => setThemeState(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              >
                <option value="system">Follow System settings</option>
                <option value="light">Light Mode aesthetic</option>
                <option value="dark">Premium Dark Mode</option>
              </select>
            </div>

            {/* Default mock duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Default mock duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={240}
                value={interviewDuration}
                onChange={(e) => setInterviewDuration(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>

            {/* Daily goals count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Daily goal targets (mock count)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>

            {/* Weekly goals count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Weekly goal targets (mock count)
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-indigo hover:shadow-lg hover:shadow-accent-indigo/20 text-white font-semibold text-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
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

export default Settings;
