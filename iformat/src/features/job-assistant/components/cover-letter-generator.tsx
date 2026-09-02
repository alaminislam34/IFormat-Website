"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Copy, FileText, Download, RotateCw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGenerateCoverLetter } from "@/hooks";
import { useAuthStore } from "@/stores/use-auth-store";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

type CoverLetterTone = "Professional" | "Enthusiastic" | "Confident" | "Concise";

export function CoverLetterGenerator() {
  const { isAuthenticated } = useAuthStore();
  const [isConsultModalOpen, setIsConsultModalOpen] = React.useState(false);
  const [jobTitle, setJobTitle] = React.useState("Senior Full Stack Developer");
  const [companyName, setCompanyName] = React.useState("Vercel Inc");
  const [recipient, setRecipient] = React.useState("Hiring Team");
  const [tone, setTone] = React.useState<CoverLetterTone>("Professional");
  const [jobDesc, setJobDesc] = React.useState(
    "We are looking for a Senior Full Stack Developer to build the future of developer tools. Experience with Next.js, React, Node.js, and edge environments is preferred. You should be passionate about developer experience, speed, and clean code."
  );
  
  const [generatedLetter, setGeneratedLetter] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const generateMutation = useGenerateCoverLetter();
  const isGenerating = generateMutation.isPending;

  const handleDemoGenerate = () => {
    const demoLetter = `Dear ${recipient || "Hiring Team"},

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. With over 8 years of dedicated experience architecting scalable cloud applications and high-conversion web platforms, I have built systems that directly enhance developer productivity and business metrics.

Throughout my career, I have specialized in modern TypeScript, Next.js architectures, and distributed systems. At my previous engagement, I led the technical modernization of core services, decreasing application latency by 42% and increasing release velocity across cross-functional squads.

What excites me most about ${companyName} is your unwavering commitment to developer experience, speed, and product excellence. I thrive in high-ownership environments and look forward to contributing my technical leadership to your team's upcoming milestones.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background and problem-solving approach align with ${companyName}'s vision.

Sincerely,
Alex Morgan
alex.morgan@example.com | linkedin.com/in/alexmorgan`;

    setGeneratedLetter(demoLetter);
    toast.success("Guest demo cover letter generated!");
  };

  const handleGenerate = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    generateMutation.mutate(
      {
        role: jobTitle,
        company: companyName,
        recipient: recipient || "Hiring Manager",
        jobDescription: jobDesc,
        tone: tone.toLowerCase(),
      },
      {
        onSuccess: (letter) => {
          setGeneratedLetter(letter);
          toast.success("Cover letter generated!");
        },
        onError: (err: any) => {
          if (err?.code === "SUBSCRIPTION_REQUIRED" || err?.statusCode === 403) {
            setShowUpgradeModal(true);
          } else {
            toast.error(err?.message || "Failed to generate cover letter");
          }
        },
      }
    );
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${companyName.replace(/\s+/g, "_")}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Cover letter downloaded!");
  };

  return (
    <div className="w-full space-y-6">
      <BookConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        serviceTitle="1-on-1 Cover Letter & Positioning Consultation"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Cover Letter Generator</h1>
          <p className="text-xs text-slate-500 mt-1">Generate ATS-tailored cover letters that resonate with hiring managers.</p>
        </div>
        <button
          onClick={() => setIsConsultModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/15 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Consult with expert
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-[#0A54B1] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Job Details</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Vercel Inc"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient (Optional)</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Hiring Manager"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Professional", "Enthusiastic", "Confident", "Concise"] as CoverLetterTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      tone === t
                        ? "border-[#0A54B1] bg-blue-50/50 text-[#0A54B1]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description / Requirements</label>
              <textarea
                rows={5}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the job requirements or role overview here..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium resize-none leading-relaxed"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Generated Cover Letter</h2>
            {generatedLetter && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 gap-1.5 cursor-pointer text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            )}
          </div>

          {generatedLetter ? (
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 min-h-96 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {generatedLetter}
            </div>
          ) : (
            <div className="h-96 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0A54B1]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">No Cover Letter Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Fill in the job details on the left, then click Generate to craft your customized ATS-tailored cover letter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueGuest={handleDemoGenerate}
        title="Sign in to generate cover letters"
        description="Create an account or sign in to generate personalized cover letters, auto-save to cloud, and access premium templates."
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Pro for Unlimited Cover Letters"
        message="You have reached the monthly AI generation limit. Upgrade your subscription to generate unlimited tailored cover letters."
      />
    </div>
  );
}
