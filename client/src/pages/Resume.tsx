import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { resumeService } from "../services/resumeService";
import type { Resume as UserResume } from "../services/resumeService";
import { useNotification } from "../context/NotificationContext";
import { TableSkeleton } from "../components/Skeletons";
import { 
  FileText, Upload, Trash2, ShieldAlert, CheckCircle2, 
  HelpCircle, Eye, Loader2, Plus, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

export const Resume: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch resumes list
  const { data: resumes = [], isLoading, error } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await resumeService.list();
      return res?.data?.resumes || [];
    }
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      return resumeService.upload(file, title);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      showToast("Success", "Resume uploaded successfully!", "success");
      setTitle("");
      setFile(null);
    },
    onError: (err: any) => {
      showToast("Upload Error", err.message || "Failed to upload PDF.", "error");
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return resumeService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      showToast("Deleted", "Resume removed successfully.", "info");
    },
    onError: (err: any) => {
      showToast("Delete Error", err.message || "Failed to delete resume.", "error");
    }
  });

  // Analyze Mutation
  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      return resumeService.analyze(id);
    },
    onSuccess: (res, resumeId) => {
      showToast("Analysis Complete", "ATS scorecard compiled!", "success");
      navigate(`/resume/${resumeId}/analyze`);
    },
    onError: (err: any) => {
      showToast("Analysis Failed", err.message || "Error analyzing resume.", "error");
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        if (!title) {
          setTitle(droppedFile.name.replace(".pdf", ""));
        }
      } else {
        showToast("Invalid File", "Only PDF documents are supported.", "warning");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(".pdf", ""));
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      showToast("Missing Fields", "Please supply a title and attach a PDF.", "warning");
      return;
    }
    uploadMutation.mutate({ file, title });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white my-0">
          Manage Resumes
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Upload and review ATS scores, missing keywords, and recommended project modifications.
        </p>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-1.5">
            <Plus className="w-5 h-5 text-accent-indigo" />
            Upload PDF
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Title field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Resume Label
              </label>
              <input
                type="text"
                placeholder="e.g. SDE II Resume"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-accent-indigo/20 focus:border-accent-indigo text-slate-900 dark:text-white outline-none focus:ring-4 transition-all text-sm"
              />
            </div>

            {/* Drag & Drop box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[150px] ${
                dragActive
                  ? "border-accent-indigo bg-accent-indigo/5"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-slate-300 dark:border-slate-800 hover:border-accent-indigo/50 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & Drop PDF here</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">or click to browse filesystem</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-600 mt-0.5">Max allowed size: 5MB</p>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-semibold text-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Upload Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resumes List Table */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4 overflow-hidden">
          <h3 className="text-base font-bold text-slate-950 dark:text-white my-0 flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-accent-indigo" />
            Uploaded Documents
          </h3>

          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex gap-2.5 text-rose-800 dark:text-rose-400 text-xs items-center">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Failed to load resume documents list.</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No resumes found</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Upload a PDF on the left to start analyzing ATS scores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <th className="pb-3 pl-2">Document</th>
                    <th className="pb-3">Uploaded Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {resumes.map((resume: UserResume) => (
                    <tr key={resume.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-xs sm:max-w-sm">
                              {resume.title}
                            </p>
                            <a
                              href={resume.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-accent-indigo hover:text-accent-purple hover:underline inline-flex items-center gap-0.5 mt-0.5"
                            >
                              Download original
                              <Eye className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(resume.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              // If it has already been analyzed, we can just navigate, but since we list summaries,
                              // let's invoke analysis. The analyze endpoint creates or returns existing analysis on server!
                              analyzeMutation.mutate(resume.id);
                            }}
                            disabled={analyzeMutation.isPending && analyzeMutation.variables === resume.id}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-indigo/10 text-accent-indigo dark:bg-accent-indigo/25 dark:text-accent-purple hover:bg-accent-indigo/20 dark:hover:bg-accent-indigo/35 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {analyzeMutation.isPending && analyzeMutation.variables === resume.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                ATS Score
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this resume?")) {
                                deleteMutation.mutate(resume.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resume;
