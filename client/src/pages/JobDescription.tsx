import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobDescriptionService } from "../services/jobDescriptionService";
import type { JobDescription as AppJD, MatchResult } from "../services/jobDescriptionService";
import { resumeService } from "../services/resumeService";
import { useNotification } from "../context/NotificationContext";
import { CardSkeleton, TableSkeleton } from "../components/Skeletons";
import { Modal } from "../components/Modal";
import { 
  Briefcase, Plus, Trash2, Sparkles, CheckCircle2, 
  AlertTriangle, AlertCircle, Loader2, ArrowRight, Play 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const JobDescription: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedJd, setSelectedJd] = useState<AppJD | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Fetch JDs
  const { data: jds = [], isLoading: isJdLoading, error: jdError } = useQuery({
    queryKey: ["jobDescriptions"],
    queryFn: async () => {
      const res = await jobDescriptionService.list();
      return res?.data?.jobDescriptions || [];
    }
  });

  // Fetch Resumes (for matching selection)
  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await resumeService.list();
      return res?.data?.resumes || [];
    }
  });

  // Create JD Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return jobDescriptionService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
      showToast("Success", "Job description saved!", "success");
      setTitle("");
      setCompany("");
      setDescription("");
      setSkillsText("");
    },
    onError: (err: any) => {
      showToast("Error", err.message || "Failed to save JD.", "error");
    }
  });

  // Delete JD Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return jobDescriptionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
      showToast("Deleted", "Job description removed.", "info");
    },
    onError: (err: any) => {
      showToast("Error", err.message || "Failed to delete.", "error");
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      showToast("Missing Fields", "Please complete all fields.", "warning");
      return;
    }
    const requiredSkills = skillsText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    createMutation.mutate({ title, company, description, requiredSkills });
  };

  const handleOpenMatch = (jd: AppJD) => {
    setSelectedJd(jd);
    setMatchResult(null);
    setMatchModalOpen(true);
    if (resumes && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    } else {
      setSelectedResumeId("");
    }
  };

  const handleRunMatch = async () => {
    if (!selectedJd || !selectedResumeId) {
      showToast("Selection Missing", "Please select a resume to match.", "warning");
      return;
    }
    setIsMatching(true);
    try {
      const res = await jobDescriptionService.match(selectedJd.id, selectedResumeId);
      if (res.success && res.data?.match) {
        setMatchResult(res.data.match);
        showToast("Success", "Comparison compiled!", "success");
      }
    } catch (err: any) {
      showToast("Match Failed", err.message || "Failed to compare.", "error");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          Job Gaps Matcher
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Submit target job specs and match keywords with your resume to see likely interview topics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-1.5">
            <Plus className="w-5 h-5 text-accent-indigo" />
            Add Job Specs
          </h3>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Company
              </label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>

            {/* Skills required */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Skills Keywords (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, TypeScript, Tailwind, System Design"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Description / Posting Text
              </label>
              <textarea
                placeholder="Paste the full job description details here..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-semibold text-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Specs...
                </>
              ) : (
                "Save Job Specs"
              )}
            </button>
          </form>
        </div>

        {/* Right Listing */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-accent-indigo" />
            Target Job Specs
          </h3>

          {isJdLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : jdError ? (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-2 text-rose-800 dark:text-rose-400 text-xs items-center">
              <AlertCircle className="w-4.5 h-4.5" />
              <span>Failed to fetch job description lists.</span>
            </div>
          ) : jds.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-card-dark">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-650 dark:text-slate-400">No jobs listed yet</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Submit job descriptions on the left to review keywords match.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jds.map((jd: AppJD) => (
                <div key={jd.id} className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4 relative hover:shadow-md transition-shadow">
                  {/* Actions */}
                  <button
                    onClick={() => {
                      if (confirm("Remove this job specs?")) {
                        deleteMutation.mutate(jd.id);
                      }
                    }}
                    className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                  {/* Header */}
                  <div>
                    <h4 className="text-base font-bold text-slate-850 dark:text-white my-0">{jd.title}</h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{jd.company}</p>
                  </div>

                  {/* Skills tags */}
                  {jd.requiredSkills && (
                    <div className="flex flex-wrap gap-1.5">
                      {jd.requiredSkills.map((sk: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action match */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenMatch(jd)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-indigo/10 text-accent-indigo dark:bg-accent-indigo/25 dark:text-accent-purple hover:bg-accent-indigo/20 dark:hover:bg-accent-indigo/35 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Compare With Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Resume Modal */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        title={`Scan Compatibility - ${selectedJd?.title}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {!matchResult ? (
            // Select Resume state
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Select Resume Document
                </label>
                {resumes && resumes.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No resumes found in your profile.</p>
                    <Link
                      to="/resume"
                      className="text-xs text-accent-indigo hover:text-accent-purple font-semibold hover:underline mt-1 inline-block"
                    >
                      Upload a PDF first
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
                  >
                    {resumes?.map(res => (
                      <option key={res.id} value={res.id}>
                        {res.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setMatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunMatch}
                  disabled={isMatching || !selectedResumeId}
                  className="px-4 py-2 text-xs font-bold bg-accent-indigo hover:bg-accent-purple text-white rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isMatching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Scanning keywords...
                    </>
                  ) : (
                    <>
                      Calculate Match
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Results State
            <div className="space-y-6">
              {/* Score dial */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" strokeWidth="8" stroke="currentColor" className="text-slate-200 dark:text-slate-800" fill="transparent" />
                    <circle cx="48" cy="48" r="40" strokeWidth="8" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - matchResult.matchPercent / 100)} stroke="currentColor" className="text-accent-cyan" fill="transparent" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">{matchResult.matchPercent}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">ATS Match Score</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
                    This score indicates the percentage of required skills and semantic terms found in your resume compared to the job posting.
                  </p>
                </div>
              </div>

              {/* Skills Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Missing Skills */}
                <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                  <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Missing Critical Skills
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.length === 0 ? (
                      <span className="text-xs italic text-slate-400">All skills matched!</span>
                    ) : (
                      matchResult.missingSkills.map((sk, index) => (
                        <span key={index} className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                  <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    Missing JD Keywords
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingKeywords.length === 0 ? (
                      <span className="text-xs italic text-slate-400">All keywords found!</span>
                    ) : (
                      matchResult.missingKeywords.map((kw, index) => (
                        <span key={index} className="px-2 py-0.5 rounded bg-rose-500/10 text-[10px] font-semibold text-rose-750 dark:text-rose-450">
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Improvements */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resume Improvements</h5>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pl-0 list-none">
                  {matchResult.resumeImprovements.length === 0 ? (
                    <li className="italic text-slate-400">No improvements suggested.</li>
                  ) : (
                    matchResult.resumeImprovements.map((imp, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{imp}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Likely interview topics */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Likely Interview Topics</h5>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.likelyInterviewTopics.length === 0 ? (
                    <span className="text-xs italic text-slate-400">No specific topics suggested.</span>
                  ) : (
                    matchResult.likelyInterviewTopics.map((topic, index) => (
                      <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {topic}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Footer close */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setMatchModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl cursor-pointer"
                >
                  Close Report
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default JobDescription;
