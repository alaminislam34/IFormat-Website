"use client";

import React from "react";
import { Building2, Check } from "lucide-react";
import { Job } from "../job-card";

interface JobDetailsContentProps {
  job: Job;
}

export function JobDetailsContent({ job }: JobDetailsContentProps) {
  return (
    <div className="space-y-6 pb-2">
      {/* About the Role */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0099FF]" />
          <span>About the Role</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
          {job.description ||
            `${job.company} makes products accessible to everyone. In this position you'll collaborate with high-performing cross-functional teams to shape world-class experiences.`}
        </p>
      </div>

      {/* Key Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Key Responsibilities
          </h3>
          <ul className="space-y-2">
            {job.responsibilities.map((resp, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0099FF] mt-1.5 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Key Responsibilities
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099FF] mt-1.5 shrink-0" />
              <span>Own end-to-end execution for core product areas</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099FF] mt-1.5 shrink-0" />
              <span>Run user research and continuous iterative testing</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099FF] mt-1.5 shrink-0" />
              <span>Collaborate directly with engineers and product leadership on implementation</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099FF] mt-1.5 shrink-0" />
              <span>Maintain and evolve scalable systems and best practices</span>
            </li>
          </ul>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Requirements
          </h3>
          <ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 stroke-[2.5]" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Requirements
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 stroke-[2.5]" />
              <span>3+ years of relevant industry experience</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 stroke-[2.5]" />
              <span>Strong analytical and problem-solving skills</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 stroke-[2.5]" />
              <span>Demonstrated track record of delivering measurable impact</span>
            </li>
          </ul>
        </div>
      )}

      {/* Nice To Have */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Nice to Have
        </h3>
        <ul className="space-y-2">
          {job.niceToHave && job.niceToHave.length > 0 ? (
            job.niceToHave.map((nth, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <span>{nth}</span>
              </li>
            ))
          ) : (
            <>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <span>Familiarity with modern collaborative workflow tools</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <span>Cross-functional communication and domain expertise</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Benefits & Perks */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Benefits & Perks
        </h3>
        <div className="flex flex-wrap gap-2">
          {job.perks && job.perks.length > 0 ? (
            job.perks.map((perk, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
              >
                {perk}
              </span>
            ))
          ) : (
            <>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                Remote-first
              </span>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                Competitive Compensation
              </span>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                Equity / Options
              </span>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                Learning & Conference Budget
              </span>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                Health & Wellness Allowance
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
