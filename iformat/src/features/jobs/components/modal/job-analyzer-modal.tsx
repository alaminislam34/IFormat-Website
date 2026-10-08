"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  TrendingUp,
  Briefcase,
  UploadCloud,
  FileUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/ai.service";
import { cvService } from "@/services/cv.service";
import { JobFitAnalysisDTO } from "@/types/api";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

interface JobAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: { id: string; title: string; company: string; description?: string };
  onApplyNow?: () => void;
  onRequireUpgrade?: (message?: string) => void;
}

export function JobAnalyzerModal({
  isOpen,
  onClose,
  job,
  onApplyNow,
  onRequireUpgrade,
}: JobAnalyzerModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobFitAnalysisDTO | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAnalysis = () => {
    if (!job?.id) return;
    setLoading(true);
    setLoadError(null);
    setAnalysis(null);

    aiService.analyzeJobFit({ jobId: job.id })
      .then((data) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        const isQuota = err?.code === "SUBSCRIPTION_REQUIRED" || [403].includes(err?.statusCode || err?.status) ||
          /(quota|limit|Upgrade to Pro|SUBSCRIPTION_REQUIRED)/i.test(err?.message || "");

        if (isQuota) {
          const msg = err?.message || "You have reached your free monthly limit. Upgrade to Pro for unlimited job match analysis.";
          setUpgradeMessage(msg);
          onRequireUpgrade ? onRequireUpgrade(msg) : setShowUpgradeModal(true);
        } else {
          const msg = err?.response?.data?.message || err?.message || "AI job fit analysis is temporarily unavailable. Please try again shortly.";
          setLoadError(msg);
        }
      });
  };

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file (.pdf).");
      return setUploadError("Only PDF resumes are supported.");
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum PDF size is 10MB.");
      return setUploadError("File size exceeds 10MB limit.");
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      toast.loading("Uploading and parsing resume with AI...", { id: "resume-upload" });
      const uploadedCv = await cvService.uploadPdf(file, file.name.replace(/\.[^/.]+$/, "") || "Uploaded Resume");
      toast.loading("Running candidate job fit evaluation...", { id: "resume-upload" });
      const analysisResult = await aiService.analyzeJobFit({ jobId: job.id, cvId: uploadedCv.id });
      setAnalysis(analysisResult);
      toast.success("Resume analyzed successfully!", { id: "resume-upload" });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to analyze resume.";
      setUploadError(errMsg);
      toast.error(errMsg, { id: "resume-upload" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!isOpen || !job?.id) return;
    fetchAnalysis();
  }, [isOpen, job?.id]);

  const score = analysis?.score ?? 0;
  const scoreTheme = score >= 75
    ? { label: "Strong Match", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    : score >= 50
    ? { label: "Moderate Fit", badge: "bg-blue-50 text-[#0A54B1] border-blue-200" }
    : { label: "Tailoring Needed", badge: "bg-amber-50 text-amber-700 border-amber-200" };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100000 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-start justify-between gap-4 bg-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#0A54B1] border border-blue-100">
                      <Sparkles className="w-3 h-3 text-[#0A54B1]" />
                      Role Fit Analysis
                    </span>
                    {analysis?.model && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
                        {analysis.model.includes("bedrock") ? "Bedrock AI" : analysis.model}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{job.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.company}</span>
                  </p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4.5 flex-1">
                {loadError ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className="text-sm font-bold text-slate-900">AI Service Temporarily Unavailable</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{loadError}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={fetchAnalysis}
                        className="h-9 px-4 rounded-lg bg-[#0A54B1] hover:bg-[#08428C] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Retry Analysis
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="h-9 px-3.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0A54B1]">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0A54B1]" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold text-slate-900">Evaluating Candidate Alignment</h4>
                      <p className="text-xs text-slate-500">Cross-referencing technical qualifications against requirements for {job.company}.</p>
                    </div>
                    <div className="w-full max-w-xs pt-1 space-y-1.5">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0A54B1] w-2/3 rounded-full animate-pulse" />
                      </div>
                      <span className="text-[11px] text-slate-400">Analyzing skills & domain fit...</span>
                    </div>
                  </div>
                ) : !analysis?.hasResume ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-amber-900">Resume Profile Required</h4>
                        <p className="text-xs text-amber-800/80">Upload your PDF resume or create one in the AI Assistant to calculate match score.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileUpload(e.dataTransfer.files?.[0]); }}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`p-5 rounded-xl border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                          isDragOver ? "border-[#0A54B1] bg-blue-50/50" : "border-slate-300 hover:border-[#0A54B1] hover:bg-slate-50/60 bg-white"
                        }`}
                      >
                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e.target.files?.[0])} accept=".pdf,application/pdf" className="hidden" disabled={isUploading} />
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0A54B1] flex items-center justify-center">
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{isUploading ? "Uploading..." : "Upload Resume (PDF)"}</h5>
                          <p className="text-[11px] text-slate-500">Drag & drop or browse (up to 10MB)</p>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h5 className="text-xs font-bold text-slate-900">Build in AI Assistant</h5>
                          <p className="text-[11px] text-slate-500">Create an ATS-tailored resume step-by-step.</p>
                        </div>
                        <Link href="/job-assistant" onClick={onClose}>
                          <Button variant="outline" className="w-full h-8 rounded-lg text-xs font-medium border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1">
                            <span>Open Builder</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e.target.files?.[0])} accept=".pdf,application/pdf" className="hidden" disabled={isUploading} />

                    {/* Active Resume Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70 text-xs">
                      <div className="font-medium text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Evaluated against active profile resume</span>
                      </div>
                      <button type="button" onClick={() => !isUploading && fileInputRef.current?.click()} disabled={isUploading} className="font-semibold text-[#0A54B1] hover:text-[#08428C] flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50">
                        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                        <span>{isUploading ? "Analyzing..." : "Upload New Resume"}</span>
                      </button>
                    </div>

                    {/* Score & Recommendation Banner */}
                    <div className="p-4.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{score}%</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${scoreTheme.badge}`}>
                            {scoreTheme.label}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">Match Score</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">{analysis.recommendation}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{analysis.summary}</p>
                      </div>
                    </div>

                    {/* 4 Pillars Progress Bars */}
                    {analysis.scoreBreakdown && (
                      <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[#0A54B1]" />
                            <span>Evaluation Pillars</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Weighted Criteria</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                          {[
                            { label: "Skills Match", value: analysis.scoreBreakdown.skills },
                            { label: "Experience Level", value: analysis.scoreBreakdown.experience },
                            { label: "Education & Credentials", value: analysis.scoreBreakdown.education },
                            { label: "Domain Alignment", value: analysis.scoreBreakdown.domainMatch },
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">{item.label}</span>
                                <span className="font-semibold text-slate-800">{item.value}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0A54B1] rounded-full" style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Key Strengths ({analysis.strengths.length})</span>
                        </div>
                        <ul className="space-y-1">
                          {analysis.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-600 mt-0.5 shrink-0 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Suggested Improvements ({analysis.gaps.length})</span>
                        </div>
                        <ul className="space-y-1">
                          {analysis.gaps.map((gap, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                              <span className="text-amber-500 mt-0.5 shrink-0 font-bold">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Verified Evidence & Citations */}
                    {analysis.evidence && analysis.evidence.length > 0 && (
                      <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0A54B1]" />
                            <span>Verified Resume Evidence ({analysis.evidence.length})</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Citations</span>
                        </div>
                        <div className="space-y-1.5">
                          {analysis.evidence.map((item, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 shrink-0 mt-0.5 sm:mt-0">
                                  {item.category.replace(/_/g, " ")}
                                </span>
                                <span className="text-slate-700 leading-snug">{item.finding}</span>
                              </div>
                              {item.source && (
                                <span className="text-[11px] font-medium text-slate-400 shrink-0 italic">
                                  {item.source}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {analysis?.hasResume && (
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Link href={`/job-assistant?tab=cover-letter&role=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`} onClick={onClose} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto h-9 px-3.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-white text-slate-700 cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0A54B1]" />
                      Generate Tailored Cover Letter
                    </Button>
                  </Link>

                  {onApplyNow && (
                    <Button onClick={() => { onClose(); onApplyNow(); }} className="w-full sm:w-auto h-9 px-4 rounded-lg bg-[#0A54B1] hover:bg-[#08428C] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <span>Proceed to Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => { setShowUpgradeModal(false); onClose(); }}
        role="candidate"
        title="AI Career Assistant Quota Reached"
        message={upgradeMessage || "You have reached your free monthly limit. Upgrade to Pro for unlimited job match analysis."}
      />
    </>
  );
}
