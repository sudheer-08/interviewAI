import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { interviewService } from "../services/interviewService";
import { useNotification } from "../context/NotificationContext";
import { 
  Play, Sparkles, AlertCircle, Compass, 
  Briefcase, CheckCircle2, ShieldAlert, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

export const InterviewSetup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Mid Level");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Technical");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState("30");

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await interviewService.create(payload);
      return res?.data?.interview || null;
    },
    onSuccess: (interview) => {
      if (interview) {
        showToast("Success", "Mock interview setup complete. Loading voice chamber...", "success");
        navigate(`/interview/${interview.id}/session`);
      }
    },
    onError: (err: any) => {
      showToast("Setup Failed", err.message || "Failed to initialize interview session.", "error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      showToast("Validation Error", "Please provide a target role title.", "warning");
      return;
    }
    createMutation.mutate({
      role,
      experience,
      difficulty,
      language,
      interviewType,
      duration: Number(duration),
    });
  };

  const rolesPreset = [
    "Frontend Engineer", "Backend Developer", "Full Stack Architect", 
    "Product Manager", "Data Analyst", "DevOps Systems Specialist"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          Start AI Mock Interview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Select mock parameters to train your response articulation. Real-time voice and text evaluations will compile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form panel */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Target Role */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Target Role Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior React Developer"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
                  />
                </div>
                
                {/* Presets suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {rolesPreset.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRole(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                        role === preset 
                          ? "bg-accent-indigo/10 text-accent-indigo border-accent-indigo" 
                          : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-600"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Experience Target
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Staff / Lead">Staff / Lead</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Interview Scenario type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Scenario Focus
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
                >
                  <option value="Technical">Technical / Coding Principles</option>
                  <option value="Behavioral">Behavioral (STAR Method)</option>
                  <option value="System Design">System Design & Architecture</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Language Medium
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Duration limits */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["15", "30", "45"].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        duration === mins 
                          ? "bg-accent-indigo text-white border-accent-indigo shadow-md shadow-accent-indigo/10" 
                          : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-750"
                      }`}
                    >
                      {mins} Mins
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan text-white font-bold text-sm shadow-xl shadow-accent-indigo/25 hover:shadow-2xl hover:shadow-accent-indigo/35 hover:-translate-y-0.5 transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Assembling scenario parameters...
                  </>
                ) : (
                  <>
                    <Play className="w-4.5 h-4.5 fill-current" />
                    Launch Practice Chamber
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="flex gap-3 items-start">
            <Compass className="w-5 h-5 text-accent-indigo flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white my-0">Chamber Walkthrough</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Ensure your microphone is connected and permissions are granted. The AI Coach will ask questions verbally. Click the mic button to speak, and click it again to submit your response.
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800/60 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Evaluation Metrics</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 pl-0 list-none">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Technical terminology usage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Behavioral STAR structures</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Wording grammar and confidence levels</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
