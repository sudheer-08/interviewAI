import React from "react";
import { Link } from "react-router-dom";
import { 
  Play, Sparkles, ShieldCheck, ArrowRight, Check,
  Mic, FileText, ChevronRight, BarChart3, HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export const Landing: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-bg-light dark:bg-bg-dark">
      {/* Background glowing gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-accent-purple/10 to-accent-indigo/10 rounded-full blur-3xl opacity-80 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl opacity-50 pointer-events-none float-bg" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-3xl opacity-40 pointer-events-none float-bg-reverse" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-indigo/10 dark:bg-accent-purple/10 border border-accent-indigo/20 text-accent-indigo dark:text-accent-purple text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation AI Interview Coach</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-slate-900 dark:text-white leading-[1.1] tracking-tight my-0 max-w-4xl mx-auto">
            Ace Your Next Job Interview with{" "}
            <span className="bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan bg-clip-text text-transparent">
              AI Real-Time Feedback
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practice mock interviews with your voice. Upload your resume and match keywords for job descriptions, view radar charts on your skills, and get personalized study roadmaps.
          </motion.p>

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-semibold text-base shadow-xl shadow-accent-indigo/25 hover:shadow-2xl hover:shadow-accent-indigo/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* App Mockup Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl overflow-hidden glass-panel bg-white/40 dark:bg-card-dark/30 p-2.5"
        >
          <div className="bg-slate-900 rounded-[1.25rem] border border-slate-950 overflow-hidden relative aspect-video">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-purple-900/30 flex flex-col items-center justify-center p-8 text-white">
              {/* Virtual AI Interview UI Demo */}
              <div className="max-w-lg w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-6 text-left shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-accent-purple/20 to-accent-cyan/10 rounded-full blur-xl" />
                
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">LIVE WAVE</span>
                </div>

                {/* Question */}
                <div className="space-y-1.5">
                  <span className="text-indigo-400 text-xs font-semibold tracking-wider uppercase font-mono">Current Question</span>
                  <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                    "Tell me about a time you made an architectural mistake. How did you identify it, and what tradeoffs did you evaluate to resolve it?"
                  </p>
                </div>

                {/* Wave simulation */}
                <div className="flex items-center gap-1.5 justify-center py-4 bg-slate-900/60 rounded-xl border border-slate-850">
                  <div className="w-1.5 h-6 bg-accent-indigo rounded-full voice-bar" />
                  <div className="w-1.5 h-10 bg-accent-purple rounded-full voice-bar" />
                  <div className="w-1.5 h-14 bg-accent-indigo rounded-full voice-bar" />
                  <div className="w-1.5 h-18 bg-accent-cyan rounded-full voice-bar" />
                  <div className="w-1.5 h-14 bg-accent-indigo rounded-full voice-bar" />
                  <div className="w-1.5 h-10 bg-accent-purple rounded-full voice-bar" />
                  <div className="w-1.5 h-6 bg-accent-indigo rounded-full voice-bar" />
                </div>

                {/* Subtitle */}
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Candidate: Speaking...</span>
                  <span className="font-mono text-emerald-400">01:45</span>
                </div>
              </div>

              {/* Centered play mockup button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 dark:bg-black/20 hover:scale-110 transition-transform w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer border border-white/20">
                <Play className="w-7 h-7 text-white fill-current ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter */}
      <section className="bg-slate-50 dark:bg-slate-950 py-12 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-accent-indigo dark:text-accent-purple">98%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">User Satisfaction</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-accent-cyan">50k+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Interviews Conducted</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-accent-indigo dark:text-accent-purple">4.9/5</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">App Store Rating</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-accent-cyan">10x</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Faster Placement</p>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
            Feature-Rich Preparation Suite
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to level up your verbal confidence and bypass resume parsing restrictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl glass-panel-interactive space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Voice & Speech Trainer</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Engage with an interactive AI Interviewer. Utilizing the Web Speech API and MediaRecorder, we record and transcribe your answers, providing pronunciation and wording tips.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel-interactive space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center text-white">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">ATS Resume Gaps</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload your resume and specific job descriptions. Our AI compares the text, calculates your matching score, lists missing keywords, and lists improvement actions.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel-interactive space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analytics and Roadmaps</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Examine detailed charts of technical and communication score progression over time, review weak skill highlights, and complete custom study modules.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / Call to Action */}
      <section className="bg-slate-50 dark:bg-slate-950/40 py-20 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
            Ready to Land Your Dream Offer?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Get unlimited mock interview setups, instant PDF analysis reports, and dynamic skills dashboards. No credit card required to start.
          </p>
          <div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-semibold text-base shadow-xl shadow-accent-indigo/25 hover:shadow-2xl hover:shadow-accent-indigo/35 hover:-translate-y-0.5 transition-all duration-300 transform active:scale-95 group"
            >
              Sign Up Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
