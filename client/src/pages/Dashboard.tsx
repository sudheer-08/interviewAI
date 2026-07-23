import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { analyticsService } from "../services/analyticsService";
import { DashboardSkeleton } from "../components/Skeletons";
import { 
  Trophy, Flame, Clock, Award, Play, AlertCircle, 
  CheckCircle2, ArrowUpRight, TrendingUp, Calendar 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const Dashboard: React.FC = () => {
  // Fetch Dashboard Stats
  const { data: dashboardData, isLoading: isDashLoading, error: dashError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await analyticsService.getDashboard();
      return res?.data?.dashboard || null;
    }
  });

  // Fetch Full Analytics (for charts and history)
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await analyticsService.getAnalytics();
      return res?.data?.analytics || null;
    }
  });

  if (isDashLoading || isAnalyticsLoading) {
    return <DashboardSkeleton />;
  }

  if (dashError || !dashboardData) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load dashboard data</h4>
          <p className="text-xs mt-0.5">Please ensure the backend server is running and database is seeded.</p>
        </div>
      </div>
    );
  }

  const recentInterviews = analyticsData?.interviewHistory?.slice(0, 3) || [];
  const progressChartData = analyticsData?.weeklyProgress?.map((item) => ({
    name: new Date(item.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Score: item.averageScore,
    Hours: item.practiceHours,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-accent-purple/10 via-accent-indigo/10 to-accent-cyan/10 border border-accent-indigo/15 dark:border-accent-purple/20 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl" />
        <div className="space-y-1 z-10">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
            Welcome back to your preparation chamber!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Configure mock parameters to practice behavioral, technical, or system design scenarios using your mic.
          </p>
        </div>
        <Link
          to="/interview/setup"
          className="z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-semibold text-sm shadow-xl shadow-accent-indigo/25 hover:shadow-2xl hover:shadow-accent-indigo/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          Start New Practice
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interviews</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5 my-0">{dashboardData.totalInterviews}</h3>
          </div>
        </div>

        {/* Avg Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Score</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5 my-0">{dashboardData.averageScore}%</h3>
          </div>
        </div>

        {/* Practice Hours */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours Active</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5 my-0">{dashboardData.hoursPracticed.toFixed(1)}h</h3>
          </div>
        </div>

        {/* Active Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Day Streak</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5 my-0">{dashboardData.currentStreak} Days</h3>
          </div>
        </div>
      </div>

      {/* Main Charts & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-950 dark:text-white my-0">Performance Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mock score averages recorded over weeks</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span>Active growth</span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {progressChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                Practice 1 session to view statistics charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressChartData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="Score" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skills Board */}
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-5">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0">Skill Analysis</h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Strongest Skill Focus</span>
              <h4 className="text-sm font-bold text-slate-850 dark:text-white mt-1">
                {dashboardData.mostImprovedSkill || "Computing Core Principles"}
              </h4>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Weakest Skill Focus</span>
              <h4 className="text-sm font-bold text-slate-850 dark:text-white mt-1">
                {dashboardData.weakestSkill || "Communication Articulation"}
              </h4>
            </div>
            
            {dashboardData.latestFeedback && (
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <span className="text-[10px] font-bold text-accent-indigo dark:text-accent-purple uppercase tracking-widest block">Latest Coach Tip</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed italic">
                  "{dashboardData.latestFeedback}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Interviews & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Mock Interviews */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-950 dark:text-white my-0">Recent Practice Logs</h3>
            <Link to="/interview/history" className="text-xs text-accent-indigo hover:text-accent-purple font-semibold flex items-center gap-0.5">
              View History
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentInterviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No recent mock sessions found. Get started by launching a mock setup!
              </div>
            ) : (
              recentInterviews.map((session) => (
                <div key={session.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                      {session.role.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-850 dark:text-white">{session.role}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        <span>{session.interviewType}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">{session.score}%</span>
                    <span className="block text-[10px] text-emerald-500 uppercase font-semibold mt-0.5">{session.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customized learning goals */}
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0">Upcoming Learning Goals</h3>
          
          <div className="space-y-3">
            {dashboardData.upcomingLearningGoals.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 flex gap-2.5 items-start text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">You're fully on track!</p>
                  <p className="mt-0.5">Complete a voice mock to generate skill recommendation points.</p>
                </div>
              </div>
            ) : (
              dashboardData.upcomingLearningGoals.map((goal, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 flex gap-3 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-accent-indigo dark:text-accent-purple flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">{goal.skill} Target</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {goal.suggestion}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
