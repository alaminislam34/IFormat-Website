"use client";

import { Sparkles, FileText, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function JobAssistantSection() {
  const tools = [
    {
      title: "AI CV & Resume Builder",
      desc: "Compile professional, ATS-optimized CVs using our step-by-step interactive wizard. Choose from beautiful layouts and let AI structure your background.",
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20"
    },
    {
      title: "AI Cover Letter Generator",
      desc: "Produce custom, highly persuasive cover letters tailored to specific job titles and company profiles. Instantly download or print.",
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20"
    },
    {
      title: "AI Outreach Email Generator",
      desc: "Draft personalized outreach messages to hiring managers with tone customization (Professional, Friendly, Confident, Concise) to maximize response rates.",
      icon: <Mail className="w-6 h-6 text-indigo-400" />,
      color: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative" id="job-assistant">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-bold tracking-wider uppercase">
              AI Powered Tools
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Your Complete <span className="text-brand-cyan">Job Assistant</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Supercharge your job application process. Construct stunning resumes, write persuasive cover letters, and draft outreach emails to hiring managers in seconds.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tools.map((tool, idx) => (
            <ScrollReveal key={idx} yOffset={40} delay={idx * 0.15}>
              <div className={`h-full p-8 rounded-3xl bg-linear-to-br ${tool.color} border backdrop-blur-xs flex flex-col justify-between group hover:scale-[1.02] hover:border-white/20 transition-all duration-300`}>
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors">{tool.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal yOffset={20} delay={0.4}>
          <div className="text-center">
            <Link href="/job-assistant" className="inline-flex items-center gap-2 px-8 h-14 rounded-2xl bg-brand-gradient text-white text-sm font-bold hover:opacity-95 transition-opacity shadow-lg shadow-blue-500/25">
              Launch Job Assistant <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
