"use client";

import React from "react";
import { Building2, Mail, Phone, FileText } from "lucide-react";
import { FileUploadPreview } from "./file-upload-preview";

interface CompanyDetailsFormProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  companyEmail: string;
  setCompanyEmail: (v: string) => void;
  contactInfo: string;
  setContactInfo: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  errors: {
    companyName?: string;
    companyEmail?: string;
    contactInfo?: string;
  };
  setErrors: React.Dispatch<React.SetStateAction<{
    companyName?: string;
    companyEmail?: string;
    contactInfo?: string;
  }>>;
  logoFile: string | null;
  logoUploading: boolean;
  logoProgress: number;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  videoFile: string | null;
  videoUploading: boolean;
  videoProgress: number;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeVideo: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CompanyDetailsForm({
  companyName,
  setCompanyName,
  companyEmail,
  setCompanyEmail,
  contactInfo,
  setContactInfo,
  description,
  setDescription,
  errors,
  setErrors,
  logoFile,
  logoUploading,
  logoProgress,
  logoInputRef,
  handleLogoChange,
  removeLogo,
  videoFile,
  videoUploading,
  videoProgress,
  videoInputRef,
  handleVideoChange,
  removeVideo,
  onSubmit,
}: CompanyDetailsFormProps) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
        Company Details
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Tell us about your company details
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Row 1: Company Name & Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Company Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Building2 className="w-4 h-4" />
              </span>
              <input
                id="companyName"
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName)
                    setErrors((prev) => ({ ...prev, companyName: undefined }));
                }}
                className={`flex h-12 w-full rounded-xl border ${
                  errors.companyName
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
              />
            </div>
            {errors.companyName && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.companyName}</p>
            )}
          </div>

          {/* Company Logo File Upload */}
          <FileUploadPreview
            label="Company Logo"
            file={logoFile}
            uploading={logoUploading}
            progress={logoProgress}
            accept="image/*"
            placeholder="Select logo file..."
            inputRef={logoInputRef}
            onFileChange={handleLogoChange}
            onRemove={removeLogo}
          />
        </div>

        {/* Row 2: Company Email */}
        <div>
          <label
            htmlFor="companyEmail"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Company Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="companyEmail"
              type="email"
              placeholder="Enter company email"
              value={companyEmail}
              onChange={(e) => {
                setCompanyEmail(e.target.value);
                if (errors.companyEmail)
                  setErrors((prev) => ({ ...prev, companyEmail: undefined }));
              }}
              className={`flex h-12 w-full rounded-xl border ${
                errors.companyEmail
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
              } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
            />
          </div>
          {errors.companyEmail && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.companyEmail}</p>
          )}
        </div>

        {/* Row 3: Contact Info */}
        <div>
          <label
            htmlFor="contactInfo"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Contact Info
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Phone className="w-4 h-4" />
            </span>
            <input
              id="contactInfo"
              type="text"
              placeholder="Enter company contact"
              value={contactInfo}
              onChange={(e) => {
                setContactInfo(e.target.value);
                if (errors.contactInfo)
                  setErrors((prev) => ({ ...prev, contactInfo: undefined }));
              }}
              className={`flex h-12 w-full rounded-xl border ${
                errors.contactInfo
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
              } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
            />
          </div>
          {errors.contactInfo && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.contactInfo}</p>
          )}
        </div>

        {/* Row 4: Upload A Video (if have any) */}
        <FileUploadPreview
          label="Upload A Video"
          sublabel="(if have any)"
          file={videoFile}
          uploading={videoUploading}
          progress={videoProgress}
          accept="video/*"
          placeholder="upload a video"
          inputRef={videoInputRef}
          isVideo
          onFileChange={handleVideoChange}
          onRemove={removeVideo}
        />

        {/* Row 5: Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Description
          </label>
          <div className="relative">
            <span className="absolute top-3.5 left-3.5 flex text-slate-400 pointer-events-none">
              <FileText className="w-4 h-4" />
            </span>
            <textarea
              id="description"
              rows={4}
              placeholder="Enter your company description..."
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setDescription(e.target.value);
                }
              }}
              className="flex w-full rounded-xl border border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20 bg-slate-50/50 px-3.5 pl-10 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all resize-none"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-semibold">
              {description.length}/500
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-12 mt-4 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
        >
          Save Details
        </button>
      </form>
    </>
  );
}
