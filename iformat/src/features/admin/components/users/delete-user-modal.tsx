"use client";

import React from "react";
import { Trash2, AlertTriangle, Loader2, X, User, Mail, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUserItemDTO } from "@/services/admin.service";

interface DeleteUserModalProps {
  user: AdminUserItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}

export function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: DeleteUserModalProps) {
  if (!isOpen || !user) return null;

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
  const isCandidate = user.role === "CANDIDATE";
  const isEmployer = user.role === "EMPLOYER";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 shadow-xs shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-user-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Remove User Account
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Soft-delete and revoke access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Highlight Card */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0A54B1] to-[#0284c7] text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {user.name || "Unnamed User"}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isEmployer
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : isCandidate
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}>
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Activity Summary if present */}
        {user._count && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCandidate && (
              <>
                <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>{user._count.applications ?? 0}</strong> Applications</span>
                </div>
                <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 flex items-center gap-2 text-slate-600">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>{user._count.cvs ?? 0}</strong> Cloud CVs</span>
                </div>
              </>
            )}
            {isEmployer && (
              <div className="col-span-2 bg-white border border-slate-200/70 rounded-xl p-2.5 flex items-center gap-2 text-slate-600">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span><strong>{user._count.jobPostings ?? 0}</strong> Published Jobs</span>
              </div>
            )}
          </div>
        )}

        {/* Caution Notice Box */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            This action will soft-delete <strong>{user.name || user.email}</strong>. Their active login sessions will be revoked and they will be moved to the Trash. You can restore this account at any time from the <strong>Soft-Deleted</strong> filter.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl text-xs font-bold px-4 h-10 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl text-xs font-bold px-5 h-10 bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing User...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
