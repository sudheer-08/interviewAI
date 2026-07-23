import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { interviewService } from "../services/interviewService";
import { analyticsService } from "../services/analyticsService";
import { Skeleton, CardSkeleton } from "../components/Skeletons";
import { 
  ArrowLeft, Award, HelpCircle, CheckCircle2, 
  AlertCircle, Lightbulb, Compass, Printer, 
  Map, Sparkles, BookOpen, AlertTriangle 
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export const FeedbackReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch individual session transcript & turn feedbacks
  const { data: sessionDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["interviewTranscript", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await interviewService.getTranscript(id);
      return res?.data || null;
    },
    enabled: !!id,
  });

  // Fetch full analytics (to get aggregated technical & communication scores for this session)
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await analyticsService.getAnalytics();
      return res?.data?.analytics || null;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (isDetailsLoading || isAnalyticsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Find matching session in analytics history to retrieve computed scores
  const historyItem = analyticsData?.interviewHistory?.find(h => h.id === id);
  const interviewSession = sessionDetails?.interviewSession;
  const feedbacks = sessionDetails?.feedbacks || [];
  const transcripts = sessionDetails?.transcripts || [];

  if (!interviewSession) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load interview report</h4>
          <p className="text-xs mt-0.5">Please check if the session is finished or re-run the interview.</p>
        </div>
      </div>
    );
  }

  // Fallbacks if history calculations aren't loaded yet
  const overallScore = historyItem?.score || (feedbacks.length > 0 ? Math.round(feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length) : 0);
  const technicalScore = historyItem?.technicalScore || Math.min(100, Math.round(overallScore * 1.05));
  const communicationScore = historyItem?.communicationScore || Math.min(100, Math.round(overallScore * 0.95));

  // Safe parsing helper
  const parseJsonArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Compile unique strengths, weaknesses, and improvement tips from all turns
  const allStrengths = Array.from(new Set(feedbacks.flatMap(f => parseJsonArray(f.strengths))));
  const allWeaknesses = Array.from(new Set(feedbacks.flatMap(f => parseJsonArray(f.weaknesses))));
  const allTips = Array.from(new Set(feedbacks.flatMap(f => parseJsonArray(f.improvementTips))));

  // Recharts Radar data
  const radarData = [
    { subject: "Communication", A: communicationScore, fullMark: 100 },
    { subject: "Technical", A: technicalScore, fullMark: 100 },
    { subject: "Problem Solving", A: Math.round((technicalScore + overallScore) / 2), fullMark: 100 },
    { subject: "Clarity", A: Math.round((communicationScore + overallScore) / 2), fullMark: 100 },
    { subject: "Confidence", A: Math.min(100, Math.round(communicationScore * 1.02)), fullMark: 100 },
    { subject: "Depth", A: Math.min(100, Math.round(technicalScore * 0.98)), fullMark: 100 },
  ];

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/interview/history"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to History
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <Link
            to="/interview/roadmap"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-indigo hover:bg-accent-purple text-white hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Map className="w-4 h-4" />
            Review Roadmap
          </Link>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="bg-white dark:bg-card-dark p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex justify-between items-center relative overflow-hidden">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-accent-indigo uppercase tracking-wider block">AI Interview Coach Evaluator</span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
            {interviewSession.role} Practice Feedback
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Level: {interviewSession.difficulty} • Type: {interviewSession.interviewType}
          </p>
        </div>
      </div>

      {/* Scoring Section (Radar + Score Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Dial */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0">Overall Rating</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" strokeWidth="10" stroke="currentColor" className="text-slate-100 dark:text-slate-800" fill="transparent" />
              <circle cx="72" cy="72" r="62" strokeWidth="10" strokeDasharray={2 * Math.PI * 62} strokeDashoffset={2 * Math.PI * 62 * (1 - overallScore / 100)} stroke="currentColor" className="text-accent-indigo dark:text-accent-purple" fill="transparent" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">{overallScore}%</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">COMPLETED</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Technical</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">{technicalScore}%</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Communication</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">{communicationScore}%</span>
            </div>
          </div>
        </div>

        {/* Recharts Radar chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0">Skills Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Detailed breakdown of communication vs depth metrics</p>
          </div>
          
          <div className="h-64 w-full flex items-center justify-center">
            {feedbacks.length === 0 ? (
              <div className="text-xs text-slate-400 dark:text-slate-650">No turns completed to plot radar statistics.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#475569" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                  <Radar name="Candidate" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Key Strengths Highlighted
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pl-0 list-none">
            {allStrengths.length === 0 ? (
              <li className="italic text-slate-400">No strengths compiled yet.</li>
            ) : (
              allStrengths.map((str, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Wording & Depth Gaps
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pl-0 list-none">
            {allWeaknesses.length === 0 ? (
              <li className="italic text-slate-400">No major weaknesses identified. Good job!</li>
            ) : (
              allWeaknesses.map((weak, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{weak}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Suggested Improvements & Better Answers */}
      <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent-purple" />
          Strategic Coach Improvement Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTips.length === 0 ? (
            <span className="text-xs italic text-slate-400">No improvement tips suggested.</span>
          ) : (
            allTips.map((tip, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 text-xs text-slate-650 dark:text-slate-400 leading-relaxed flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Granular Turn-by-Turn transcript feedbacks */}
      <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-indigo" />
            Turn-by-Turn Response Evaluations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review each question asked and the granular turn analysis.</p>
        </div>

        <div className="space-y-6">
          {feedbacks.map((f, idx) => {
            // Find corresponding question and candidate answer transcript by sequence order
            // sequence in feedback corresponds to the candidate's answer sequence. The question is answerSequence - 1.
            const questionTurn = transcripts.find(t => t.sequence === f.sequence - 1);
            const answerTurn = transcripts.find(t => t.sequence === f.sequence);

            return (
              <div key={f.id} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-850 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-md bg-accent-indigo/10 text-accent-indigo dark:bg-accent-indigo/25 dark:text-accent-purple text-[10px] font-bold">
                    Turn {idx + 1} ({f.currentTopic || "Interview Scenario"})
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white font-heading">Score: {f.score}/100</span>
                </div>

                {/* Question */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Interviewer Question</span>
                  <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    "{questionTurn?.content || "Mock Question text"}"
                  </p>
                </div>

                {/* Candidate Answer */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono">Your Wording</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    "{answerTurn?.content || "No transcript collected"}"
                  </p>
                </div>

                {/* Granular Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-emerald-500">Key Strengths</span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 list-disc space-y-1">
                      {parseJsonArray(f.strengths).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-rose-500">Suggested Improvements</span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 list-disc space-y-1">
                      {parseJsonArray(f.improvementTips).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
