"use client";

import { Building2, Check, Video, Globe, ExternalLink } from "lucide-react";
import { Job } from "../job-card";

interface JobDetailsContentProps {
  job: Job;
}

export function JobDetailsContent({ job }: JobDetailsContentProps) {
  const companyLogo = job.companyLogoUrl || job.employer?.companyLogoUrl;
  const companyVideo = job.companyVideoUrl || job.employer?.companyVideoUrl;
  const companyDescription =
    job.employer?.companyDescription ||
    `${job.company} is a leading brand focused on innovation, excellence, and collaborative talent development.`;
  const companyWebsite = job.employer?.companyWebsite;

  return (
    <div className="space-y-6 pb-2">
      <div className="p-4 rounded-2xl bg-linear-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200/60 flex items-center justify-center text-primary font-bold text-base shadow-xs shrink-0">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${job.company} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                (job.company || "C").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {job.company}
              </h4>
              <span className="text-[11px] font-medium text-slate-500">
                Company Profile & Media
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {companyDescription}
        </p>

        {companyVideo ? (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Video className="w-4 h-4 text-[#0099FF]" />
              <span>Company Spotlight Video</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video relative shadow-inner">
              <video
                src={companyVideo}
                controls
                className="w-full h-full object-contain"
                poster={companyLogo || undefined}
              >
                Your browser does not support HTML video playback.
              </video>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-500 font-medium">
            <Video className="w-4 h-4 text-slate-400 shrink-0" />
            <span>No company introduction video uploaded yet for this employer.</span>
          </div>
        )}
      </div>

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
      {job.responsibilities && job.responsibilities.length > 0 && (
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
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
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
      )}

      {/* Nice To Have */}
      {job.niceToHave && job.niceToHave.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Nice to Have
          </h3>
          <ul className="space-y-2">
            {job.niceToHave.map((nth, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <span>{nth}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits & Perks */}
      {job.perks && job.perks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Benefits & Perks
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.perks.map((perk, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
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
