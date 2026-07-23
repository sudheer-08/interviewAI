import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data);
      navigate("/dashboard");
    } catch (err: any) {
      // Errors are handled inside AuthContext via Toasts
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to access your interview dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              placeholder="name@example.com"
              {...registerField("email")}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${
                errors.email 
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" 
                  : "border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo"
              } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-4 transition-all text-sm`}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-rose-500 mt-1 pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...registerField("password")}
              className={`w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${
                errors.password 
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" 
                  : "border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo"
              } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-4 transition-all text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-rose-500 mt-1 pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-indigo hover:shadow-xl hover:shadow-accent-indigo/20 text-white font-semibold text-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Redirect link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-accent-indigo hover:text-accent-purple transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
};

export default Login;
