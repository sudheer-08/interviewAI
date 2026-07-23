import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { User as UserIcon, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      navigate("/dashboard");
    } catch (err: any) {
      // Handled inside AuthContext
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
          Create Account
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign up to begin your AI interview mock sessions
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <UserIcon className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="John Doe"
              {...registerField("fullName")}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${
                errors.fullName 
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" 
                  : "border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo"
              } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-4 transition-all text-sm`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-medium text-rose-500 mt-1 pl-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

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
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Password
          </label>
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...registerField("confirmPassword")}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${
                errors.confirmPassword 
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" 
                  : "border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo"
              } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-4 transition-all text-sm`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-rose-500 mt-1 pl-1">
              {errors.confirmPassword.message}
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
              Registering...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Redirect link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-accent-indigo hover:text-accent-purple transition-colors"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
};

export default Register;
