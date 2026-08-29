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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">My Cloud Resumes</h3>
              <p className="text-xs text-slate-400">Load, switch, or manage your saved resumes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          <button
            onClick={onNewResume}
            className="w-full p-4 rounded-2xl border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-800/40 hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-blue-400 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Start New Blank Resume
          </button>

          {loadingCVs ? (
            <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Loading saved resumes...
            </div>
          ) : !userCVs || userCVs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
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
                      ? "bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10"
                      : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{cv.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        v{versionNum}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Active
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
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
