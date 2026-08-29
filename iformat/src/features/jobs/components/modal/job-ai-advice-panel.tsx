"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { motion as m } from "framer-motion";

interface JobAiAdvicePanelProps {
  show: boolean;
}

export function JobAiAdvicePanel({ show }: JobAiAdvicePanelProps) {
  if (!show) return null;

  return (
    <m.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-sky-100 bg-[#f0f7fa] rounded-2xl p-4 space-y-2.5 mt-2"
    >
      <div className="flex items-center gap-1.5 text-sky-600 font-bold text-xs uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" /> iFormat AI Optimization Tips
      </div>
      <ul className="text-xs text-slate-600 space-y-2 font-medium">
        <li className="flex items-start gap-1.5">
          <span className="text-sky-500 font-bold">•</span>
          <span>
            <strong>Structure:</strong> Start with a strong 1-sentence hook explaining why this role is crucial to the company&apos;s growth.
          </span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="text-sky-500 font-bold">•</span>
          <span>
            <strong>Keywords:</strong> Use industry-standard terms to maximize compatibility with applicant tracking systems (ATS).
          </span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="text-sky-500 font-bold">•</span>
          <span>
            <strong>Action Verbs:</strong> Rather than saying &quot;Responsible for&quot;, use words like &quot;Pioneer&quot;, &quot;Architect&quot;, &quot;Lead&quot;, and &quot;Deliver&quot;.
          </span>
        </li>
      </ul>
    </m.div>
  );
}
