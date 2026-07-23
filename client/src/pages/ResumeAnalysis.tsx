import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { resumeService } from "../services/resumeService";
import { Skeleton, CardSkeleton } from "../components/Skeletons";
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, 
  Lightbulb, Briefcase, FileText, Download, Printer 
} from "lucide-react";
import { motion } from "framer-motion";

export const ResumeAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch resume by id, which includes analysis nested
  const { data: resumePayload, isLoading, error } = useQuery({
    queryKey: ["resumeAnalysis", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await resumeService.getById(id);
      return res?.data?.resume || null;
    },
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (error || !resumePayload) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-400 items-center">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to load resume analysis</h4>
          <p className="text-xs mt-0.5">Please check if the resume exists or re-run the analysis.</p>
        </div>
      </div>
    );
  }

  const analysis = resumePayload.analysis;

  if (!analysis) {
    return (
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-950 dark:text-white my-0">No Analysis Compiled</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          We haven't parsed this resume. Go back to Resumes and trigger the ATS Score compiler.
        </p>
        <Link
          to="/resume"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-indigo text-white font-semibold text-xs rounded-xl shadow-md hover:bg-accent-purple transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resumes
        </Link>
      </div>
    );
  }

  // Safe parsing helper since Json might be stringified on prisma
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

  const strengths = parseJsonArray(analysis.strengths);
  const weaknesses = parseJsonArray(analysis.weaknesses);
  const missingSkills = parseJsonArray(analysis.missingSkills);
  const grammarIssues = parseJsonArray(analysis.grammarIssues);
  const formattingIssues = parseJsonArray(analysis.formattingIssues);
  const improvementTips = parseJsonArray(analysis.improvementTips);
  const suggestedProjects = parseJsonArray(analysis.suggestedProjects);

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/resume"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Resumes
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Hero */}
      <div className="bg-white dark:bg-card-dark p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold text-accent-indigo dark:text-accent-purple uppercase tracking-widest block">ATS Gaps Scanner</span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1 my-0">
            {resumePayload.title} Analysis Report
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
            Analysis compiled: {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Dials / Scoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Score Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex flex-col items-center text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0">Resume Score</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" strokeWidth="12" stroke="currentColor" className="text-slate-100 dark:text-slate-800" fill="transparent" />
              <circle cx="72" cy="72" r="62" strokeWidth="12" strokeDasharray={2 * Math.PI * 62} strokeDashoffset={2 * Math.PI * 62 * (1 - analysis.resumeScore / 100)} stroke="currentColor" className="text-accent-indigo dark:text-accent-purple" fill="transparent" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">{analysis.resumeScore}</span>
              <span className="text-[10px] font-semibold text-slate-400">out of 100</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
            Reflects overall content coverage, formatting structure consistency, and wording clarity.
          </p>
        </div>

        {/* ATS Score Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex flex-col items-center text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0">ATS Score</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" strokeWidth="12" stroke="currentColor" className="text-slate-100 dark:text-slate-800" fill="transparent" />
              <circle cx="72" cy="72" r="62" strokeWidth="12" strokeDasharray={2 * Math.PI * 62} strokeDashoffset={2 * Math.PI * 62 * (1 - analysis.atsScore / 100)} stroke="currentColor" className="text-accent-cyan" fill="transparent" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">{analysis.atsScore}</span>
              <span className="text-[10px] font-semibold text-slate-400">compatibility</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
            Evaluates matching thresholds against common corporate resume parsers and tracking indices.
          </p>
        </div>
      </div>

      {/* Strengths & Weaknesses Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Identified Strengths
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 list-none pl-0">
            {strengths.length === 0 ? (
              <li className="italic text-slate-400">No core strengths highlighted.</li>
            ) : (
              strengths.map((str, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Resume Weaknesses
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 list-none pl-0">
            {weaknesses.length === 0 ? (
              <li className="italic text-slate-400">No formatting or phrasing gaps found!</li>
            ) : (
              weaknesses.map((weak, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{weak}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Gaps List & Formatting Concerns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missing Skills */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length === 0 ? (
              <span className="text-xs italic text-slate-400">No missing critical keywords.</span>
            ) : (
              missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Grammar & Wording */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Wording & Grammar
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 pl-0 list-none">
            {grammarIssues.length === 0 ? (
              <li className="italic text-emerald-500 flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4" />
                No spelling or grammar errors found!
              </li>
            ) : (
              grammarIssues.map((issue, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{issue}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Formatting Issues */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent-purple" />
            Formatting Flags
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 pl-0 list-none">
            {formattingIssues.length === 0 ? (
              <li className="italic text-emerald-500 flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4" />
                Document formatting is fully optimized.
              </li>
            ) : (
              formattingIssues.map((issue, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{issue}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Suggested Projects & Improvement Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suggested Projects */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent-cyan" />
            Recommended Projects to Add
          </h3>
          <div className="space-y-3">
            {suggestedProjects.length === 0 ? (
              <p className="text-xs italic text-slate-400">No project add-ons suggested.</p>
            ) : (
              suggestedProjects.map((project, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {project}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coach Tips */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider my-0 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-purple" />
            Strategic Resume Tips
          </h3>
          <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-400 pl-0 list-none">
            {improvementTips.length === 0 ? (
              <li className="italic text-slate-400">No additional tips.</li>
            ) : (
              improvementTips.map((tip, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
