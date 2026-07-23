import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Terminal, Moon, Sun, Monitor, Laptop } from "lucide-react";

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white shadow-md shadow-accent-purple/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan bg-clip-text text-transparent">
              InterviewAI
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/40 dark:border-slate-700/40">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "light" 
                    ? "bg-white text-accent-indigo shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 text-accent-cyan shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "system" 
                    ? "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="System Theme"
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>

            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-purple to-accent-indigo text-white hover:shadow-lg hover:shadow-accent-indigo/20 transition-all duration-300 transform active:scale-95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-accent-indigo dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-purple to-accent-indigo text-white hover:shadow-lg hover:shadow-accent-indigo/20 transition-all duration-300 transform active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              InterviewAI
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} InterviewAI Inc. All rights reserved. Powered by Advanced AI models.
          </p>
          <div className="flex gap-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-accent-indigo dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-indigo dark:hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
