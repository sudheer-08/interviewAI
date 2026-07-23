import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardSkeleton } from "../components/Skeletons";

// Lazy-loaded pages
const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Resume = lazy(() => import("../pages/Resume"));
const ResumeAnalysis = lazy(() => import("../pages/ResumeAnalysis"));
const JobDescription = lazy(() => import("../pages/JobDescription"));
const InterviewSetup = lazy(() => import("../pages/InterviewSetup"));
const VoiceInterview = lazy(() => import("../pages/VoiceInterview"));
const FeedbackReport = lazy(() => import("../pages/FeedbackReport"));
const LearningRoadmap = lazy(() => import("../pages/LearningRoadmap"));
const InterviewHistory = lazy(() => import("../pages/InterviewHistory"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const NotFound = lazy(() => import("../pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-8">
    <div className="max-w-7xl w-full">
      <DashboardSkeleton />
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          {/* Authentication Routes (Only if guest) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Panel Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/resume/:id/analyze" element={<ResumeAnalysis />} />
              <Route path="/job-description" element={<JobDescription />} />
              <Route path="/interview/setup" element={<InterviewSetup />} />
              <Route path="/interview/:id/session" element={<VoiceInterview />} />
              <Route path="/interview/:id/feedback" element={<FeedbackReport />} />
              <Route path="/interview/roadmap" element={<LearningRoadmap />} />
              <Route path="/interview/history" element={<InterviewHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
export default AppRouter;
