import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analyticsService";
import { TableSkeleton } from "../components/Skeletons";
import { 
  BarChart3, TrendingUp, Clock, BookOpen, 
  AlertCircle, ArrowUpRight, ShieldAlert, Award 
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Legend, CartesianGrid 
} from "recharts";

export const Analytics: React.FC = () => {
  // Fetch full analytics
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load analytics data</h4>
          <p className="text-xs mt-0.5">Please check if the backend is running and database has populated logs.</p>
        </div>
      </div>
    );
  }

  // Parse chart series
  const growthChartData = analyticsData.weeklyProgress?.map((item) => ({
    name: new Date(item.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Technical: item.technicalScore,
    Communication: item.communicationScore,
    Average: item.averageScore,
  })) || [];

  const practiceChartData = analyticsData.practiceTime?.series?.map((item) => ({
    name: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Hours: Number(item.value.toFixed(2)),
  })) || [];

  const topicsList = analyticsData.topicAccuracy || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          Analytics Overview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Detailed metrics charting technical coding vs STAR communication score changes over weeks.
        </p>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical vs Communication Area Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-indigo" />
              Skill Progress Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Technical coding vs STAR communication trends</p>
          </div>

          <div className="h-72 w-full">
            {growthChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete mock interviews to load skill trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e293b", 
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: 10 }} />
                  <Area type="monotone" dataKey="Technical" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.05} />
                  <Area type="monotone" dataKey="Communication" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Practice Hours Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-indigo" />
              Practice Volume
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total hours logged in voice simulations</p>
          </div>

          <div className="h-72 w-full">
            {practiceChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete mock interviews to load volume charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={practiceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e293b", 
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="Hours" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Topic Accuracy table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
        <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-indigo" />
          Scenario & Topic Analytics
        </h3>

        {topicsList.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-600">
            No topic accuracy metrics available. Practice interviews to divide metrics by categories.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">Subject / Topic</th>
                  <th className="pb-3 text-center">Interviews Count</th>
                  <th className="pb-3 text-center">Accuracy Score</th>
                  <th className="pb-3 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {topicsList.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 pl-2 font-semibold text-sm text-slate-800 dark:text-white">
                      {item.topic}
                    </td>
                    <td className="py-4 text-center text-xs text-slate-650 dark:text-slate-400">
                      {item.interviewCount} sessions
                    </td>
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-lg text-xs font-extrabold text-slate-805 dark:text-slate-200">
                        {item.averageScore}%
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-xs font-bold ${
                        item.growth >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {item.growth >= 0 ? `+${item.growth}%` : `${item.growth}%`}
                      </span>
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

export default Analytics;
