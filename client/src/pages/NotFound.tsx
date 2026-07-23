import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, MoveLeft } from "lucide-react";
import { motion } from "framer-motion";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-md w-full text-center space-y-6 z-10"
      >
        <div className="w-24 h-24 rounded-3xl bg-accent-purple/10 dark:bg-accent-purple/20 flex items-center justify-center text-accent-indigo dark:text-accent-purple mx-auto shadow-inner">
          <HelpCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold font-heading bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan bg-clip-text text-transparent my-0 select-none">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-semibold shadow-lg shadow-accent-indigo/25 hover:shadow-xl hover:shadow-accent-indigo/35 hover:-translate-y-0.5 transition-all duration-300 group active:scale-95"
          >
            <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
