"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Mail, Send, Check, RotateCw, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGenerateEmail } from "@/hooks";
import { useAuthStore } from "@/stores/use-auth-store";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

type ToneType = "Professional" | "Friendly" | "Confident" | "Concise";

export function EmailGenerator() {
  const { isAuthenticated } = useAuthStore();
  const [isConsultModalOpen, setIsConsultModalOpen] = React.useState(false);
  const [recipient, setRecipient] = React.useState("Sarah Johnson");
  const [role, setRole] = React.useState("Engineering Lead");
  const [company, setCompany] = React.useState("Stripe");
  const [context, setContext] = React.useState(
    "Applying for the Senior Full Stack Engineer role. Experienced in building APIs, cloud microservices, and high-conversion web platforms with Next.js and PostgreSQL."
  );
  const [tone, setTone] = React.useState<ToneType>("Professional");
  
  const [generatedEmail, setGeneratedEmail] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const generateMutation = useGenerateEmail();
  const isGenerating = generateMutation.isPending;

  const handleDemoGenerate = () => {
    const demoEmail = `Subject: Application & Introduction: ${role} - ${recipient}

Dear ${recipient || "Hiring Manager"},

I am writing to express my strong interest in the ${role || "open position"} at ${company || "your team"}.

With extensive experience architecting high-performance web systems and full-stack cloud applications, I have consistently driven measurable improvements in system throughput, conversion velocity, and team agility.

I have followed ${company || "your company"}'s recent milestones with great admiration and would welcome the opportunity to discuss how my technical leadership and background can deliver immediate value to your current roadmap.

Thank you for your time and consideration.

Warm regards,
Alex Morgan
linkedin.com/in/alexmorgan`;

    setGeneratedEmail(demoEmail);
    toast.success("Guest demo outreach email generated!");
  };

  const handleGenerate = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    generateMutation.mutate(
      {
        recipient,
        role,
        company,
        context,
        tone,
      },
      {
        onSuccess: (email) => {
          setGeneratedEmail(email);
          toast.success("Outreach email generated!");
        },
        onError: (err: any) => {
          if (err?.code === "SUBSCRIPTION_REQUIRED" || err?.statusCode === 403) {
            setShowUpgradeModal(true);
          } else {
            toast.error(err?.message || "Failed to generate email");
          }
        },
      }
    );
  };

  const handleCopy = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!generatedEmail) return;
    const mailto = `mailto:${recipient.toLowerCase().replace(/\s+/g, "")}@example.com?subject=${encodeURIComponent(
      generatedEmail.split("\n")[0].replace("Subject: ", "")
    )}&body=${encodeURIComponent(generatedEmail.split("\n").slice(2).join("\n"))}`;
    window.location.href = mailto;
    toast.success("Opening default email client...");
  };

  return (
    <div className="w-full space-y-6">
      <BookConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        serviceTitle="1-on-1 Outreach Strategy Consultation"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Outreach Email Generator</h1>
          <p className="text-xs text-slate-500 mt-1">Generate high-converting networking, referral, and recruiter outreach messages.</p>
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
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Email Details</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient Name</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Engineering Lead"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Professional", "Friendly", "Confident", "Concise"] as ToneType[]).map((t) => (
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Context & Key Qualifications</label>
              <textarea
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Mention why you are reaching out, your notable achievements, or shared connections..."
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
                  Generating Outreach Email...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Outreach Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Generated Email</h2>
            {generatedEmail && (
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
                  onClick={handleExport}
                  size="sm"
                  className="rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white gap-1.5 cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Open Client
                </Button>
              </div>
            )}
          </div>

          {generatedEmail ? (
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div className="space-y-1.5 border-b border-slate-200/60 pb-4">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">To:</span> {recipient} &lt;{recipient.toLowerCase().replace(/\s+/g, "")}@example.com&gt;
                </div>
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">Subject:</span> {generatedEmail.split("\n")[0].replace("Subject: ", "")}
                </div>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {generatedEmail.split("\n").slice(2).join("\n")}
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0A54B1]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">No Email Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Fill in the recipient and role details on the left, then click Generate to craft your customized outreach message.
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
        title="Sign in to generate outreach emails"
        description="Create an account or sign in to generate personalized emails, save history, and manage templates."
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Pro for Unlimited Outreach AI"
        message="You have reached the monthly AI email generation limit. Upgrade your subscription to generate unlimited outreach emails."
      />
    </div>
  );
}
