"use client";

import React from "react";
import { FolderOpen, Plus, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVDTO } from "@/types/api";

interface SavedResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCVs: CVDTO[] | undefined;
  loadingCVs: boolean;
  activeCvId: string | null;
  onLoadCV: (cv: CVDTO) => void;
  onNewResume: () => void;
  onDeleteCV: (id: string, e: React.MouseEvent) => void;
}

export function SavedResumesModal({
  isOpen,
  onClose,
  userCVs,
  loadingCVs,
  activeCvId,
  onLoadCV,
  onNewResume,
  onDeleteCV,
}: SavedResumesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl text-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#0A54B1] rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Cloud Resumes</h3>
              <p className="text-xs text-slate-500">Load, switch, or manage your saved resume versions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-light p-1 cursor-pointer transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          <button
            onClick={onNewResume}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-sky-300 hover:border-[#0A54B1] bg-sky-50/30 hover:bg-sky-50/70 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-[#0A54B1] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Start New Blank Resume
          </button>

          {loadingCVs ? (
            <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0A54B1]" /> Loading saved resumes...
            </div>
          ) : !userCVs || userCVs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm bg-slate-50/60 rounded-2xl border border-slate-100 p-6">
              No resumes saved to your cloud account yet. Click &quot;Save to Cloud&quot; to preserve your work.
            </div>
          ) : (
            userCVs.map((cv) => {
              const versionNum = cv.versions?.[0]?.versionNumber || 1;
              const isCurrent = activeCvId === cv.id;
              return (
                <div
                  key={cv.id}
                  onClick={() => onLoadCV(cv)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isCurrent
                      ? "bg-blue-50/70 border-[#0A54B1]/40 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{cv.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0A54B1] border border-blue-200">
                        v{versionNum}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Last updated {new Date(cv.updatedAt || cv.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => onDeleteCV(cv.id, e)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer rounded-xl px-5 h-9"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
