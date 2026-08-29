"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface ApplyCoverNoteFieldProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  coverNoteLength: number;
  isAiGenerating: boolean;
  onAiDraft: () => void;
}

export function ApplyCoverNoteField({
  register,
  errors,
  coverNoteLength,
  isAiGenerating,
  onAiDraft,
}: ApplyCoverNoteFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Cover Note / Pitch
        </label>
        <button
          type="button"
          onClick={onAiDraft}
          disabled={isAiGenerating}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isAiGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Auto-draft with AI
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <textarea
          rows={4}
          maxLength={2000}
          {...register("coverNote")}
          placeholder="Highlight your key achievements and why you're a great match for this role..."
          className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        {errors.coverNote ? (
          <p className="text-xs text-red-500 font-medium">
            {errors.coverNote.message as string}
          </p>
        ) : (
          <span />
        )}
        <span
          className={`text-[10px] font-semibold ${
            coverNoteLength > 1900 ? "text-amber-600" : "text-slate-400"
          }`}
        >
          {coverNoteLength} / 2000
        </span>
      </div>
    </div>
  );
}
