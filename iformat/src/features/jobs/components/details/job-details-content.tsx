"use client";

import React from "react";
import { Briefcase, CheckCircle2, Sparkles } from "lucide-react";
import { Job } from "../job-card";

interface JobDetailsContentProps {
  job: Job;
}

export function JobDetailsContent({ job }: JobDetailsContentProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          About the Role
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {job.description}
        </p>
      </div>

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" /> Key Responsibilities
          </h3>
          <ul className="space-y-2.5">
            {job.responsibilities.map((resp, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0A54B1]" /> Requirements
          </h3>
          <ul className="space-y-2.5">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nice To Have */}
      {job.niceToHave && job.niceToHave.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Nice to Have
          </h3>
          <ul className="space-y-2.5">
            {job.niceToHave.map((nth, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-1 shrink-0" />
                <span>{nth}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Perks & Benefits */}
      {job.perks && job.perks.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Perks & Benefits
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.perks.map((perk, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full border border-sky-100"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
