import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { analyticsService } from "../services/analyticsService";
import type { HistoryItem } from "../services/analyticsService";
import { TableSkeleton } from "../components/Skeletons";
import { History, Award, Play, AlertCircle, Eye, Calendar, Sparkles } from "lucide-react";

export const InterviewHistory: React.FC = () => {
  // Fetch full analytics (which returns interviewHistory list)
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await analyticsService.getAnalytics();
      return res?.data?.analytics || null;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load interview history</h4>
          <p className="text-xs mt-0.5">Please check if the backend is running and you have completed mock sessions.</p>
        </div>
      </div>
    );
  }

  const history = analyticsData.interviewHistory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
            Interview History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View score trends and read detailed feedback reports for your past mock sessions.
          </p>
        </div>
        <Link
          to="/interview/setup"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-accent-indigo hover:bg-accent-purple text-white hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <Play className="w-4.5 h-4.5 fill-current" />
          Start New Practice
        </Link>
      </div>

      {/* History Table Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
        <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-2">
          <History className="w-5 h-5 text-accent-indigo" />
          Mock Sessions Log
        </h3>

        {history.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <History className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-400">No mock sessions recorded</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Configure and launch your first mock setup to generate score sheets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">Session Role</th>
                  <th className="pb-3">Interview Focus</th>
                  <th className="pb-3 text-center">Score Card</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {history.map((session: HistoryItem) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold uppercase text-xs">
                          {session.role.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-850 dark:text-white truncate max-w-xs sm:max-w-md">
                            {session.role}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(session.date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">{session.interviewType}</span>
                      <span className="block text-[10px] text-slate-400">{session.topic}</span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Award className="w-3.5 h-3.5 text-accent-indigo" />
                        <span>{session.score}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        to={`/interview/${session.id}/feedback`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Feedback
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple skeleton fallback helper
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
  );
};

export default InterviewHistory;
