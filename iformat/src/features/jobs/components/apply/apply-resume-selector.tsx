"use client";

import React, { RefObject } from "react";
import { Paperclip, Loader2, UploadCloud, FileText, Trash2 } from "lucide-react";
import { CVDTO } from "@/types/api";

interface ApplyResumeSelectorProps {
  resumeMode: "cloud" | "upload";
  setResumeMode: (mode: "cloud" | "upload") => void;
  selectedCvId: string;
  setSelectedCvId: (id: string) => void;
  userCVs: CVDTO[] | undefined;
  loadingCVs: boolean;
  uploadedFile: File | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export function ApplyResumeSelector({
  resumeMode,
  setResumeMode,
  selectedCvId,
  setSelectedCvId,
  userCVs,
  loadingCVs,
  uploadedFile,
  fileInputRef,
  onFileChange,
  onRemoveFile,
}: ApplyResumeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-blue-600" /> Resume / CV
        </label>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setResumeMode("cloud")}
            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
              resumeMode === "cloud"
                ? "bg-white text-[#0A54B1] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Saved Resumes
          </button>
          <button
            type="button"
            onClick={() => setResumeMode("upload")}
            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
              resumeMode === "upload"
                ? "bg-white text-[#0A54B1] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Upload PDF
          </button>
        </div>
      </div>

      {resumeMode === "cloud" ? (
        loadingCVs ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-3 bg-slate-50 rounded-xl px-3.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your resumes...
          </div>
        ) : userCVs && userCVs.length > 0 ? (
          <select
            value={selectedCvId}
            onChange={(e) => setSelectedCvId(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
          >
            <option value="">-- Do not attach saved CV --</option>
            {userCVs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.title} (v{cv.versions?.[0]?.versionNumber || 1})
              </option>
            ))}
          </select>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>No saved resumes yet.</span>
            <button
              type="button"
              onClick={() => setResumeMode("upload")}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Upload PDF directly
            </button>
          </div>
        )
      ) : (
        /* Direct PDF Upload Dropzone */
        <div>
          <input
            ref={fileInputRef as any}
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileChange}
            className="hidden"
            id="resume-file-input"
          />

          {uploadedFile ? (
            <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</p>
                  <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB • Ready to submit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="resume-file-input"
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer group"
            >
              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1 transition-colors" />
              <p className="text-xs font-semibold text-slate-700">Click to upload or drag & drop PDF</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Maximum size: 10MB (.pdf)</p>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
