import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Terminal, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg-light dark:bg-bg-dark">
      {/* Left side panel (hidden on mobile, animated features showcase) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-slate-950 text-white flex-col justify-between p-12 overflow-hidden border-r border-slate-900">
        {/* Animated backdrop glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-accent-purple/20 to-accent-cyan/15 rounded-full blur-3xl opacity-60 pointer-events-none float-bg" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent-indigo/20 to-accent-purple/10 rounded-full blur-3xl opacity-50 pointer-events-none float-bg-reverse" />

        {/* Header Logo */}
        <div className="z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white shadow-lg shadow-accent-purple/20">
              <Terminal className="w-6.5 h-6.5" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan bg-clip-text text-transparent">
              InterviewAI
            </span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="z-10 my-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-heading font-bold text-white leading-tight">
              Elevate Your Interview Performance with Advanced AI.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Practice mock behavioral and technical coding interviews, receive granular ATS analysis, and custom-tailor resumes.
            </p>
          </motion.div>

          {/* Testimonial cards */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Voice & Text Analytics</h4>
                <p className="text-xs text-slate-400 mt-1">Real-time transcripts, voice evaluation, and customized grammar advice.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <Sparkles className="w-6 h-6 text-accent-cyan flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">ATS Resume Gaps Scanner</h4>
                <p className="text-xs text-slate-400 mt-1">Compare your current resume directly to job descriptions and match skills.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <ShieldCheck className="w-6 h-6 text-accent-purple flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Curated Roadmaps</h4>
                <p className="text-xs text-slate-400 mt-1">Personalized lists of recommended projects and weak-skill target actions.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>Version 1.0.0</span>
          <span>&copy; {new Date().getFullYear()} InterviewAI Inc.</span>
        </div>
      </div>

      {/* Right side form container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 lg:px-20 relative">
        {/* Floating gradient glow on dark backgrounds */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-tr from-accent-purple/10 to-accent-indigo/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="max-w-md w-full space-y-8 bg-white dark:bg-card-dark p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
