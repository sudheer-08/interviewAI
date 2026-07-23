import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analyticsService";
import { Skeleton, CardSkeleton } from "../components/Skeletons";
import { 
  Map, Compass, CheckCircle2, ChevronRight, 
  Lightbulb, BookOpen, AlertCircle, Play 
} from "lucide-react";
import { Link } from "react-router-dom";

export const LearningRoadmap: React.FC = () => {
  // Fetch Dashboard goals
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await analyticsService.getDashboard();
      return res?.data?.dashboard || null;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load roadmap goals</h4>
          <p className="text-xs mt-0.5 font-mono">Please practice mock sessions to generate customized coach roadmaps.</p>
        </div>
      </div>
    );
  }

  const goals = dashboardData.upcomingLearningGoals || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
            Learning Roadmap
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your customized learning timelines based on your weakest vocal and engineering marks.
          </p>
        </div>
        <Link
          to="/interview/setup"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-accent-indigo hover:bg-accent-purple text-white hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <Play className="w-4.5 h-4.5 fill-current" />
          Practice Mock
        </Link>
      </div>

      {/* Main Roadmap Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline block */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-6">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-2">
            <Map className="w-5 h-5 text-accent-indigo" />
            Target Core Timelines
          </h3>

          {goals.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Compass className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-750 dark:text-slate-400">All target roadmaps completed!</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Launch mock sessions to verify skill levels and suggest new modules.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-6 space-y-8 ml-3">
              {goals.map((goal, idx) => (
                <div key={idx} className="relative space-y-2">
                  {/* Timeline circle */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-card-dark border-2 border-accent-indigo ring-4 ring-white dark:ring-card-dark text-[9px] font-bold text-accent-indigo">
                    {idx + 1}
                  </span>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Target Area Focus
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {goal.skill} Optimization
                    </h4>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    {goal.suggestion}
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between max-w-xl">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Recommended exercise: STAR method drill</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Study Advice Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-1.5">
              <Lightbulb className="w-5 h-5 text-accent-purple" />
              General Study Advice
            </h3>
            
            <div className="space-y-4 text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
              <div className="flex gap-2 items-start">
                <BookOpen className="w-4.5 h-4.5 text-accent-indigo flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Practice Daily:</strong> Dedicating 15 minutes of vocal practice is more effective than weekly cramming.
                </p>
              </div>

              <div className="flex gap-2 items-start">
                <BookOpen className="w-4.5 h-4.5 text-accent-indigo flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Self-Listen:</strong> Open past recordings, check the feedback text, and check where you hesitated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmap;
