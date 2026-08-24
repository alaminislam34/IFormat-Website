"use client";

import * as React from "react";
import { Sparkles, Copy, FileText, Download, RotateCw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGenerateCoverLetter } from "@/hooks";

export function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = React.useState("Senior Full Stack Developer");
  const [companyName, setCompanyName] = React.useState("Vercel Inc");
  const [jobDesc, setJobDesc] = React.useState(
    "We are looking for a Senior Full Stack Developer to build the future of developer tools. Experience with Next.js, React, Node.js, and edge environments is preferred. You should be passionate about developer experience, speed, and clean code."
  );
  
  const [generatedLetter, setGeneratedLetter] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const generateMutation = useGenerateCoverLetter();
  const isGenerating = generateMutation.isPending;

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        role: jobTitle,
        company: companyName,
        experienceContext: jobDesc,
      },
      {
        onSuccess: (letter) => {
          setGeneratedLetter(letter);
          toast.success("Cover letter generated!");
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
    const file = new Blob([generatedLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${companyName.replace(/\s+/g, "_")}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Cover letter downloaded!");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cover Letter Generator</h1>
        <button className="px-5 py-2.5 bg-linear-to-r from-brand-cyan to-[#0ea5e9] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/15 hover:opacity-90 transition-opacity self-start sm:self-auto">
          Consult with expert
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center">
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Innovate Corp"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
              <textarea
                rows={6}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the full job description here to help the AI tailor your letter..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium leading-relaxed resize-none"
              />
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
                Generating Cover Letter...
              </>
            ) : (
              <>
                <span>Generate Cover Letter</span>
                <Sparkles className="w-4 h-4" />
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
                disabled={!generatedLetter}
                variant="outline"
                className="h-9 px-3 rounded-lg border-slate-200 text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!generatedLetter}
                variant="outline"
                className="h-9 px-3 rounded-lg border-slate-200 text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !generatedLetter}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0A54B1] hover:underline disabled:opacity-50"
            >
              <RotateCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>

          <div className="flex-1 py-4 flex flex-col justify-center select-text">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
                <span className="text-sm font-semibold text-slate-500">AI is tailoring your cover letter...</span>
              </div>
            ) : generatedLetter ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-600 font-medium text-left max-w-full overflow-x-auto">
                {generatedLetter}
              </pre>
            ) : (
              <div className="text-center py-20 space-y-4 max-w-xs mx-auto">
                <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto border border-sky-100 shadow-sm animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cover letter will appear here</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Fill in the job details on the left and click generate to start.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
