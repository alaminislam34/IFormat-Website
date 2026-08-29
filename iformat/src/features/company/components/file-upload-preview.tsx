"use client";

import React from "react";
import { CheckCircle, Trash2, Paperclip, Video } from "lucide-react";
import { motion } from "framer-motion";

interface FileUploadPreviewProps {
  label: string;
  sublabel?: string;
  file: string | null;
  uploading: boolean;
  progress: number;
  accept: string;
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isVideo?: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function FileUploadPreview({
  label,
  sublabel,
  file,
  uploading,
  progress,
  accept,
  placeholder,
  inputRef,
  isVideo = false,
  onFileChange,
  onRemove,
}: FileUploadPreviewProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        {label} {sublabel && <span className="text-[10px] text-slate-400 font-normal lowercase">{sublabel}</span>}
      </label>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        accept={accept}
        className="hidden"
      />
      <div className="relative">
        {file ? (
          <div className="flex h-12 items-center justify-between px-3.5 rounded-xl border border-green-200 bg-green-50/20 text-sm">
            <span className="flex items-center gap-2 text-green-600 font-semibold truncate max-w-75">
              {isVideo ? <Video className="w-4.5 h-4.5 shrink-0" /> : <CheckCircle className="w-4.5 h-4.5 shrink-0" />}
              {file}
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : uploading ? (
          <div className="flex h-12 flex-col justify-center px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden">
            <span className="text-xs text-slate-500 font-semibold mb-1">
              Uploading {isVideo ? "Video" : "Logo"}... {progress}%
            </span>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-[#52CEDE] to-[#0A54B1]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-400 text-sm text-left hover:border-[#0A54B1] hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
          >
            <span className="truncate">{placeholder}</span>
            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
