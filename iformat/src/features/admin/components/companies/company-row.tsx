"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Loader2,
  Play,
  Briefcase,
  Phone,
  Mail,
  Eye,
  Calendar,
  Sparkles,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { AdminUserItemDTO } from "@/services/admin.service";

interface CompanyRowProps {
  company: AdminUserItemDTO;
  uploadingLogoId: string | null;
  onLogoUpload: (companyId: string, file: File) => void;
  onToggleVerification: (company: AdminUserItemDTO) => void;
  onDeleteCompany: (company: AdminUserItemDTO) => void;
  onPreviewVideo: (url: string, companyName: string) => void;
}

export function CompanyRow({
  company: c,
  uploadingLogoId,
  onLogoUpload,
  onToggleVerification,
  onDeleteCompany,
  onPreviewVideo,
}: CompanyRowProps) {
  const companyDisplayName = c.companyName || c.name || "Company";
  const logoLetter = companyDisplayName.charAt(0).toUpperCase();

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors group">
      {/* Company Info (Logo, Name, Email, Phone, Website) */}
      <TableCell className="py-4">
        <div className="flex items-center gap-3.5">
          {/* Logo with upload hover */}
          <div className="relative group/logo w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {c.companyLogoUrl ? (
              <img
                src={c.companyLogoUrl}
                alt={`${companyDisplayName} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-[#0A54B1] to-indigo-700 text-white font-bold text-sm flex items-center justify-center">
                {logoLetter}
              </div>
            )}

            {uploadingLogoId === c.id ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            ) : (
              <label
                htmlFor={`table-logo-input-${c.id}`}
                title="Change company logo"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[9px] font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
              </label>
            )}
            <input
              id={`table-logo-input-${c.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingLogoId === c.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLogoUpload(c.id, file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm truncate max-w-56">
                {companyDisplayName}
              </span>
              {c.companyWebsite &&
                !["yopmail.com", "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com"].some(
                  (d) => c.companyWebsite?.toLowerCase().includes(d)
                ) && (
                  <a
                    href={c.companyWebsite.startsWith("http") ? c.companyWebsite : `https://${c.companyWebsite}`}
                    target="_blank"
                    rel="noreferrer"
                    title={c.companyWebsite}
                    className="text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 truncate max-w-48">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{c.email}</span>
              </span>
              {c.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{c.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Trust & Verification Status */}
      <TableCell className="py-4">
        {c.isVerifiedCompany ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        )}
      </TableCell>

      {/* Subscription Tier */}
      <TableCell className="py-4">
        {c.subscription?.plan ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200/80">
            {c.subscription.plan.name}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Free Tier</span>
        )}
      </TableCell>

      {/* Job Listings Count */}
      <TableCell className="py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/60">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>{c._count?.jobPostings || 0} Jobs</span>
        </span>
      </TableCell>

      {/* Media & Public Profile Links */}
      <TableCell className="py-4">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/companies/${encodeURIComponent(companyDisplayName)}`}
            target="_blank"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            <Eye className="w-3 h-3 text-slate-400" />
            <span>Profile</span>
          </Link>

          {c.companyVideoUrl && (
            <button
              onClick={() => onPreviewVideo(c.companyVideoUrl!, companyDisplayName)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs text-rose-700 font-medium transition-colors cursor-pointer"
              title="Watch employer culture reel"
            >
              <Play className="w-3 h-3 fill-current text-rose-600" />
              <span>Reel</span>
            </button>
          )}
        </div>
      </TableCell>

      {/* Registration Date */}
      <TableCell className="py-4 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1 text-slate-500">
          <Calendar className="w-3 h-3 text-slate-400" />
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      </TableCell>

      {/* Action Buttons */}
      <TableCell className="py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={() => onToggleVerification(c)}
            className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              c.isVerifiedCompany
                ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 shadow-xs"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            }`}
          >
            {c.isVerifiedCompany ? (
              <span className="flex items-center gap-1">
                <X className="w-3 h-3" />
                Revoke
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Verify
              </span>
            )}
          </Button>

          <button
            type="button"
            onClick={() => onDeleteCompany(c)}
            className="h-8 w-8 rounded-xl border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/80 hover:text-red-700 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
            title={`Delete ${companyDisplayName}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
