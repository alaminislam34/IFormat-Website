"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Mail, Send, Check, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGenerateEmail } from "@/hooks";
import { useAuthStore } from "@/stores/use-auth-store";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

type ToneType = "Professional" | "Friendly" | "Confident" | "Concise";

export function EmailGenerator() {
  const { isAuthenticated } = useAuthStore();
  const [recipient, setRecipient] = React.useState("Sarah Johnson");
  const [role, setRole] = React.useState("Engineering Lead");
  const [company, setCompany] = React.useState("Stripe");
  const [context, setContext] = React.useState(
    "Applying for the Full Stack Engineer role. Experienced in building APIs and scalable backend integrations with Next.js and Postgres."
  );
  const [tone, setTone] = React.useState<ToneType>("Professional");
  
  const [generatedEmail, setGeneratedEmail] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const generateMutation = useGenerateEmail();
  const isGenerating = generateMutation.isPending;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Email Generator</h1>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-brand-cyan to-[#0ea5e9] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/15 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 self-start sm:self-auto cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Consult with expert
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center">
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Their Role</label>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Context (optional)</label>
              <textarea
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any specific details to personalise the email..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tone</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                {(["Professional", "Friendly", "Confident", "Concise"] as ToneType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 text-[10px] md:text-[11px] font-bold rounded-lg transition-all ${
                      tone === t
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-brand-gradient text-white hover:opacity-95 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Email...
              </>
            ) : (
              <>
                <span>Generate Email</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Right Side: Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6 min-h-125 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopy}
                disabled={!generatedEmail}
                variant="outline"
                className="h-9 px-3 rounded-lg border-slate-200 text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                onClick={handleExport}
                disabled={!generatedEmail}
                variant="outline"
                className="h-9 px-3 rounded-lg border-slate-200 text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                Export / Send
              </Button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !generatedEmail}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0A54B1] hover:underline disabled:opacity-50"
            >
              <RotateCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>

          <div className="flex-1 py-4 flex flex-col justify-center select-text">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
                <span className="text-sm font-semibold text-slate-500">AI is drafting your email...</span>
              </div>
            ) : generatedEmail ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-600 font-medium text-left max-w-full overflow-x-auto">
                {generatedEmail}
              </pre>
            ) : (
              <div className="text-center py-20 space-y-4 max-w-xs mx-auto">
                <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto border border-sky-100 shadow-sm animate-pulse">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your email will appear here</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Fill in the details on the left and click generate to start.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <AuthPromptModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Sign in to Generate Outreach Email"
          description="Create a free account to generate personalized outreach emails with AI and save them to your account."
          redirectUrl="/job-assistant"
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}
