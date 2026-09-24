"use client";

import React from "react";
import { Cloud, FolderOpen, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CloudCvToolbarProps {
  isAuthenticated: boolean;
  activeCvId: string | null;
  activeCvTitle: string;
  activeVersionNumber: number;
  totalCVsCount: number;
  isSaving: boolean;
  onOpenSavedModal: () => void;
  onSaveToCloud: () => void;
}

export function CloudCvToolbar({
  isAuthenticated,
  activeCvId,
  activeCvTitle,
  activeVersionNumber,
  totalCVsCount,
  isSaving,
  onOpenSavedModal,
  onSaveToCloud,
}: CloudCvToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs print:hidden no-print">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 bg-sky-50 text-[#0A54B1] rounded-2xl border border-sky-100 flex items-center justify-center shrink-0">
          <Cloud className="w-5 h-5 text-[#0A54B1]" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900">
              {activeCvId ? activeCvTitle : "Unsaved Resume Draft"}
            </span>
            {activeCvId ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Version {activeVersionNumber}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Draft
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAuthenticated
              ? activeCvId
                ? "Synced to cloud. Every save increments your version history."
                : "Save to your cloud account for instant job applications and versioning."
              : "Log in or save to preserve multiple resume versions in your account."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {isAuthenticated && (
          <Button
            onClick={onOpenSavedModal}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-all"
          >
            <FolderOpen className="w-4 h-4 mr-1.5 text-[#0A54B1]" />
            My Resumes {totalCVsCount > 0 ? `(${totalCVsCount})` : ""}
          </Button>
        )}

        <Button
          onClick={onSaveToCloud}
          disabled={isSaving}
          size="sm"
          className="h-9 px-4 text-xs bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold shadow-sm active:scale-95 transition-all rounded-xl cursor-pointer disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {activeCvId ? "Save New Version" : "Save to Cloud"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
