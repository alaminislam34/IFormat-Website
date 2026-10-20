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
  ArrowLeft,
  Briefcase,
  UploadCloud,
  FileUp,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/ai.service";
import { cvService } from "@/services/cv.service";
import { CVDTO, JobFitAnalysisDTO } from "@/types/api";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

interface JobAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: { id: string; title: string; company: string; description?: string };
  onApplyNow?: () => void;
  onRequireUpgrade?: (message?: string) => void;
}

type ViewTab = "analysis" | "raw";
type RawTab = "response" | "request";

/* ----------------------------- display helpers ---------------------------- */

const SOURCE_LABELS: Record<string, string> = {
  cv_json: "Resume",
  user_info: "Profile",
  job_description: "Job post",
};

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** "cv_json: raw_text → CORE SKILLS" → "Resume · Core Skills" */
function formatSource(source?: string) {
  if (!source) return "";
  const [root, ...rest] = source.split(":");
  const rootLabel = SOURCE_LABELS[root.trim()] ?? titleCase(root);
  const path = rest.join(":").split(/→|->/).map((p) => p.trim()).filter(Boolean);
  const section = path.length > 1 ? path[path.length - 1] : "";
  return section ? `${rootLabel} · ${titleCase(section)}` : rootLabel;
}

/** Pulls inline "(cv_json: raw_text → SECTION)" citations out of AI sentences. */
const CITATION_RE = /\s*\(((?:cv_json|user_info|job_description)[^()]*)\)/g;
function splitCitations(text: string) {
  const sources: string[] = [];
  const clean = text
    .replace(CITATION_RE, (_, src: string) => {
      sources.push(formatSource(src));
      return "";
    })
    .replace(/\s+([.,;])/g, "$1")
    .trim();
  return { text: clean, sources: Array.from(new Set(sources)) };
}

function scoreTone(score?: number) {
  if (score === undefined) return { ring: "#94a3b8", badge: "bg-slate-50 text-slate-700 border-slate-200", label: "" };
  if (score >= 70) return { ring: "#059669", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Strong match" };
  if (score >= 40) return { ring: "#d97706", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Partial match" };
  return { ring: "#dc2626", badge: "bg-red-50 text-red-700 border-red-200", label: "Low match" };
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso?: string) {
  if (!iso) return "";
  const diffSec = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, sec] of units) {
    if (Math.abs(diffSec) >= sec) return relativeTime.format(Math.round(diffSec / sec), unit);
  }
  return "just now";
}

function resumeSource(cv: CVDTO) {
  const version = cv.versions?.[0];
  if (!version) return "Resume";
  return version.content?.source === "pdf_upload" ? "Uploaded PDF" : "Built in AI Assistant";
}

/** Default resume first, then most recently updated. */
function pickDefaultResume(list: CVDTO[]) {
  return list.find((cv) => cv.isDefault) ?? list[0];
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 leading-none">{Math.round(pct)}</span>
        <span className="text-[10px] text-slate-400 font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function SourceChips({ sources }: { sources: string[] }) {
  if (!sources.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1 mt-1">
      {sources.map((s) => (
        <span key={s} className="px-1.5 py-px rounded text-[10px] font-medium bg-slate-100 text-slate-500">
          {s}
        </span>
      ))}
    </span>
  );
}

function FindingList({ items, dotClass }: { items: string[]; dotClass: string }) {
  return (
    <ul className="space-y-2.5">
      {items.map((raw, idx) => {
        const { text, sources } = splitCitations(raw);
        return (
          <li key={idx} className="flex items-start gap-2.5">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
            <div className="text-[13px] text-slate-700 leading-relaxed">
              <p>{text}</p>
              <SourceChips sources={sources} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(value ?? null, null, 2);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };
  return (
    <div className="relative rounded-xl border border-slate-200 bg-slate-950 overflow-hidden">
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-white/10 text-slate-200 hover:bg-white/20 cursor-pointer"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="p-4 pr-20 text-[11.5px] leading-relaxed text-slate-100 font-mono whitespace-pre-wrap wrap-break-word max-h-[55vh] overflow-auto">
        {json}
      </pre>
    </div>
  );
}

function CenteredState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
      {icon}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        {children}
      </div>
    </div>
  );
}

const BREAKDOWN_LABELS: Array<[keyof NonNullable<JobFitAnalysisDTO["scoreBreakdown"]>, string]> = [
  ["skills", "Skills"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["domainMatch", "Domain match"],
];

/* --------------------------------- modal ---------------------------------- */

export function JobAnalyzerModal({
  isOpen,
  onClose,
  job,
  onApplyNow,
  onRequireUpgrade,
}: JobAnalyzerModalProps) {
  // Resume selection
  const [resumes, setResumes] = useState<CVDTO[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumesError, setResumesError] = useState<string | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);

  // Analysis
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobFitAnalysisDTO | null>(null);
  const [view, setView] = useState<ViewTab>("analysis");
  const [rawTab, setRawTab] = useState<RawTab>("response");

  // Upload & upgrade
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResumes = async () => {
    setResumesLoading(true);
    setResumesError(null);
    try {
      const list = (await cvService.listUserCVs()).filter((cv) => !cv.isDeleted);
      setResumes(list);
      setSelectedCvId((current) =>
        current && list.some((cv) => cv.id === current) ? current : pickDefaultResume(list)?.id ?? null
      );
    } catch (err: any) {
      setResumesError(err?.response?.data?.message || err?.message || "Could not load your resumes.");
    } finally {
      setResumesLoading(false);
    }
  };

  const runAnalysis = async (cvId: string) => {
    setLoading(true);
    setLoadError(null);
    setPickerError(null);
    setAnalysis(null);
    try {
      const data = await aiService.analyzeJobFit({ jobId: job.id, cvId });
      if (!data.hasResume) {
        setPickerError("We couldn't read any text from this resume. Pick another one or upload a new PDF.");
        return;
      }
      setAnalysis(data);
      setView("analysis");
      setRawTab("response");
    } catch (err: any) {
      const isQuota =
        err?.code === "SUBSCRIPTION_REQUIRED" ||
        err?.response?.data?.error?.code === "SUBSCRIPTION_REQUIRED";

      if (isQuota) {
        const msg = err?.message || "You have reached your free monthly limit. Upgrade to Pro for unlimited job match analysis.";
        setUpgradeMessage(msg);
        onRequireUpgrade ? onRequireUpgrade(msg) : setShowUpgradeModal(true);
      } else {
        setLoadError(err?.response?.data?.message || err?.message || "AI job fit analysis is temporarily unavailable. Please try again shortly.");
      }
    } finally {
      setLoading(false);
    }
  };

  /** Uploading from inside the analyzer signals intent, so analyze right away. */
  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file (.pdf).");
      return setPickerError("Only PDF resumes are supported.");
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum PDF size is 10MB.");
      return setPickerError("File size exceeds 10MB limit.");
    }

    setPickerError(null);
    setIsUploading(true);
    try {
      toast.loading("Uploading and parsing resume...", { id: "resume-upload" });
      const uploadedCv = await cvService.uploadPdf(file, file.name.replace(/\.[^/.]+$/, "") || "Uploaded Resume");
      toast.success("Resume uploaded", { id: "resume-upload" });
      setResumes((prev) => [uploadedCv, ...prev.filter((cv) => cv.id !== uploadedCv.id)]);
      setSelectedCvId(uploadedCv.id);
      await runAnalysis(uploadedCv.id);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to upload resume.";
      setPickerError(errMsg);
      toast.error(errMsg, { id: "resume-upload" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const backToPicker = () => {
    setAnalysis(null);
    setLoadError(null);
  };

  // Each open starts at the resume picker; nothing is sent to the AI until the user asks.
  useEffect(() => {
    if (!isOpen || !job?.id) return;
    setAnalysis(null);
    setLoadError(null);
    setPickerError(null);
    loadResumes();
  }, [isOpen, job?.id]);

  const tone = scoreTone(analysis?.score);
  const breakdown = analysis?.scoreBreakdown;
  const hasBreakdown = !!breakdown && BREAKDOWN_LABELS.some(([k]) => typeof breakdown[k] === "number");
  const hasResult = !!analysis?.hasResume && !loading && !loadError;
  // The backend only includes raw AI data for debug accounts
  const canSeeRaw = analysis?.rawAiResponse !== undefined;
  const showPicker = !resumesLoading && !resumesError && !loading && !loadError && !analysis && resumes.length > 0;
  const busy = loading || isUploading;

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
              <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e.target.files?.[0])} accept=".pdf,application/pdf" className="hidden" disabled={busy} />

              {/* Header */}
              <div className="px-6 pt-5 pb-0 border-b border-slate-100 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0A54B1]">
                      <Sparkles className="w-3 h-3" />
                      Role Fit Analysis
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">{job.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company}</span>
                    </p>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {hasResult && canSeeRaw ? (
                  <div className="flex items-center gap-5 mt-4 text-xs font-semibold">
                    {([
                      ["analysis", "Analysis", Sparkles],
                      ["raw", "Raw AI data", Code2],
                    ] as const).map(([key, label, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setView(key)}
                        className={`pb-2.5 -mb-px border-b-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                          view === key ? "border-[#0A54B1] text-[#0A54B1]" : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {resumesLoading ? (
                  <CenteredState icon={<Loader2 className="w-5 h-5 animate-spin text-[#0A54B1]" />} title="Loading your resumes" />
                ) : resumesError ? (
                  <CenteredState
                    icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                    title="Couldn't load your resumes"
                  >
                    <p className="text-xs text-slate-500">{resumesError}</p>
                    <Button onClick={loadResumes} variant="outline" className="mt-3 h-8 px-3 rounded-lg text-xs cursor-pointer">
                      Try again
                    </Button>
                  </CenteredState>
                ) : loading ? (
                  <CenteredState
                    icon={
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0A54B1]" />
                      </div>
                    }
                    title="Analyzing your fit"
                  >
                    <p className="text-xs text-slate-500">
                      Comparing <span className="font-semibold text-slate-700">{resumes.find((cv) => cv.id === selectedCvId)?.title || "your resume"}</span> against the requirements for {job.title}. This can take up to 30 seconds.
                    </p>
                  </CenteredState>
                ) : loadError ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-3.5">
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-center text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 w-full max-w-md">
                      <h4 className="text-sm font-bold text-slate-900">The analysis didn't finish</h4>
                      <div className="text-xs text-red-600 bg-red-50/80 p-3 rounded-lg border border-red-200 font-mono text-left whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
                        {loadError}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => selectedCvId && runAnalysis(selectedCvId)}
                        className="h-9 px-4 rounded-lg bg-[#0A54B1] hover:bg-[#08428C] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                        Try again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={backToPicker}
                        className="h-9 px-3.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                      >
                        Choose another resume
                      </Button>
                    </div>
                  </div>
                ) : analysis?.hasResume ? (
                  view === "raw" && canSeeRaw ? (
                    /* ------------------------- Raw AI data view ------------------------- */
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Exact data exchanged with the AI screening service for this analysis. Use it to compare what the model returned with what the Analysis tab shows.
                      </p>
                      <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-xs font-semibold">
                        {([
                          ["response", "AI response"],
                          ["request", "Request sent"],
                        ] as const).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setRawTab(key)}
                            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                              rawTab === key ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {rawTab === "response" ? (
                        <JsonBlock value={analysis.rawAiResponse} />
                      ) : analysis.aiRequest ? (
                        <JsonBlock value={analysis.aiRequest} />
                      ) : (
                        <p className="text-xs text-slate-500 py-6 text-center">The server did not include the request payload.</p>
                      )}
                    </div>
                  ) : (
                    /* --------------------------- Analysis view -------------------------- */
                    <div className="space-y-5">
                      {/* Resume in use */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="shrink-0">Evaluated against</span>
                          <span className="font-semibold text-slate-800 truncate">{analysis.resumeTitle || "your resume"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => selectedCvId && runAnalysis(selectedCvId)} className="font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Re-analyze</span>
                          </button>
                          <button type="button" onClick={backToPicker} className="font-semibold text-[#0A54B1] hover:text-[#08428C] flex items-center gap-1 cursor-pointer">
                            <FileUp className="w-3.5 h-3.5" />
                            <span>Change resume</span>
                          </button>
                        </div>
                      </div>

                      {/* Score */}
                      {(analysis.score !== undefined || analysis.recommendation || analysis.summary) && (
                        <div className="p-5 rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50/80 to-white">
                          <div className="flex items-center gap-4">
                            {typeof analysis.score === "number" && <ScoreRing score={analysis.score} color={tone.ring} />}
                            <div className="space-y-1.5 min-w-0">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Match score</div>
                              <div className="flex flex-wrap items-center gap-2">
                                {tone.label && <span className="text-base font-bold text-slate-900">{tone.label}</span>}
                                {analysis.recommendation && (
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${tone.badge}`}>
                                    {analysis.recommendation}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {hasBreakdown && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                              {BREAKDOWN_LABELS.map(([key, label]) => {
                                const val = breakdown?.[key];
                                if (typeof val !== "number") return null;
                                return (
                                  <div key={key} className="space-y-1.5">
                                    <div className="flex items-baseline justify-between text-[11px]">
                                      <span className="font-medium text-slate-500">{label}</span>
                                      <span className="font-bold text-slate-800">{Math.round(val)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, val))}%`, backgroundColor: scoreTone(val).ring }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {analysis.summary && (
                            <p className="text-[13px] text-slate-600 leading-relaxed mt-4 pt-4 border-t border-slate-100">
                              {splitCitations(analysis.summary).text}
                            </p>
                          )}
                        </div>
                      )}

                      {analysis.strengths && analysis.strengths.length > 0 && (
                        <section className="space-y-3">
                          <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            What matches
                            <span className="text-xs font-medium text-slate-400">({analysis.strengths.length})</span>
                          </h4>
                          <FindingList items={analysis.strengths} dotClass="bg-emerald-500" />
                        </section>
                      )}

                      {analysis.gaps && analysis.gaps.length > 0 && (
                        <section className="space-y-3">
                          <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Gaps to address
                            <span className="text-xs font-medium text-slate-400">({analysis.gaps.length})</span>
                          </h4>
                          <FindingList items={analysis.gaps} dotClass="bg-amber-500" />
                        </section>
                      )}

                      {analysis.score === undefined && !analysis.recommendation && !analysis.summary && (!analysis.strengths || analysis.strengths.length === 0) && (!analysis.gaps || analysis.gaps.length === 0) && (
                        <div className="py-8 text-center text-xs text-slate-500">
                          AI returned no match evaluation data for this job.{canSeeRaw && " Check the Raw AI data tab."}
                        </div>
                      )}

                      {analysis.evidence && analysis.evidence.length > 0 && (
                        <section className="space-y-3">
                          <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <ShieldCheck className="w-4 h-4 text-[#0A54B1]" />
                            Evidence from resume
                          </h4>
                          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                            {analysis.evidence.map((item, idx) => (
                              <div key={idx} className="p-3.5 grid sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:pt-0.5">
                                  {titleCase(item.category || "other")}
                                </span>
                                <div className="text-[13px] text-slate-700 leading-relaxed">
                                  <p>{splitCitations(item.finding).text}</p>
                                  {item.source && <SourceChips sources={[formatSource(item.source)]} />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {(analysis.model || analysis.tokensUsed) && (
                        <p className="text-[11px] text-slate-400 text-right font-mono">
                          {analysis.model}
                          {analysis.tokensUsed ? ` · ${analysis.tokensUsed.toLocaleString()} tokens` : ""}
                        </p>
                      )}
                    </div>
                  )
                ) : resumes.length === 0 ? (
                  /* --------------------------- No resume yet --------------------------- */
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Add a resume to see your match</h4>
                      <p className="text-xs text-slate-500">We compare your resume with this job's requirements and show what matches and what's missing.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileUpload(e.dataTransfer.files?.[0]); }}
                        onClick={() => !busy && fileInputRef.current?.click()}
                        className={`p-5 rounded-xl border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                          isDragOver ? "border-[#0A54B1] bg-blue-50/50" : "border-slate-300 hover:border-[#0A54B1] hover:bg-slate-50/60 bg-white"
                        }`}
                      >
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

                    {pickerError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{pickerError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* --------------------------- Resume picker --------------------------- */
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Which resume should we compare?</h4>
                      <p className="text-xs text-slate-500">Pick a saved resume or upload a new one. The analysis runs only when you click Analyze.</p>
                    </div>

                    <div role="radiogroup" className="space-y-2">
                      {resumes.map((cv) => {
                        const selected = cv.id === selectedCvId;
                        return (
                          <button
                            key={cv.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => { setSelectedCvId(cv.id); setPickerError(null); }}
                            className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                              selected ? "border-[#0A54B1] bg-blue-50/50 ring-1 ring-[#0A54B1]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? "border-[#0A54B1]" : "border-slate-300"}`}>
                              {selected && <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />}
                            </span>
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-slate-900 truncate">{cv.title}</span>
                                {cv.isDefault && (
                                  <span className="px-1.5 py-px rounded text-[10px] font-semibold bg-slate-100 text-slate-600 shrink-0">Default</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {resumeSource(cv)} · Updated {timeAgo(cv.updatedAt)}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => !busy && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileUpload(e.dataTransfer.files?.[0]); }}
                        disabled={busy}
                        className={`w-full p-3.5 rounded-xl border border-dashed flex items-center gap-3 text-left transition-colors cursor-pointer disabled:opacity-60 ${
                          isDragOver ? "border-[#0A54B1] bg-blue-50/50" : "border-slate-300 hover:border-[#0A54B1] hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0A54B1] flex items-center justify-center shrink-0 ml-7">
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[13px] font-semibold text-slate-900">{isUploading ? "Uploading..." : "Upload a new resume"}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">PDF up to 10MB · analyzed right after upload</p>
                        </div>
                      </button>
                    </div>

                    {pickerError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{pickerError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {showPicker && (
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={onClose} className="h-9 px-3.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-white text-slate-600 cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedCvId && runAnalysis(selectedCvId)}
                    disabled={!selectedCvId || busy}
                    className="h-9 px-4 rounded-lg bg-[#0A54B1] hover:bg-[#08428C] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze match
                  </Button>
                </div>
              )}

              {hasResult && (
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {view === "analysis" || !canSeeRaw ? (
                    <Link href={`/job-assistant?tab=cover-letter&role=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`} onClick={onClose} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto h-9 px-3.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-white text-slate-700 cursor-pointer">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0A54B1]" />
                        Generate Tailored Cover Letter
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" onClick={() => setView("analysis")} className="w-full sm:w-auto h-9 px-3.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-white text-slate-700 cursor-pointer">
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      Back to analysis
                    </Button>
                  )}

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
