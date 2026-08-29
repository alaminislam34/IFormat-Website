"use client";

import React from "react";
import { Cloud, FolderOpen, Save, Loader2 } from "lucide-react";
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
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {activeCvId ? activeCvTitle : "Unsaved Resume Draft"}
            </span>
            {activeCvId && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Version {activeVersionNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {isAuthenticated
              ? activeCvId
                ? "Synced to cloud. Every save increments your version history."
                : "Save to your cloud account for instant job applications and versioning."
              : "Log in to save multiple resume versions to your account."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {isAuthenticated && (
          <Button
            onClick={onOpenSavedModal}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-medium cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 mr-1.5 text-blue-400" />
            My Cloud Resumes {totalCVsCount > 0 ? `(${totalCVsCount})` : ""}
          </Button>
        )}

        <Button
          onClick={onSaveToCloud}
          disabled={isSaving}
          size="sm"
          className="h-9 px-4 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
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
