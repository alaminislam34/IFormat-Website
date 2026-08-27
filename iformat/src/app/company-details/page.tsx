"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Paperclip,
  Trash2,
  CheckCircle,
  Video,
  ArrowRight,
} from "lucide-react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { toast } from "sonner";

export default function CompanyDetailsPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [description, setDescription] = useState("");

  // Simulated File Uploads
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{
    companyName?: string;
    companyEmail?: string;
    contactInfo?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Logo Upload Simulation
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUploading(true);
      setLogoProgress(0);
      const interval = setInterval(() => {
        setLogoProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setLogoUploading(false);
            setLogoFile(file.name);
            return 100;
          }
          return prev + 25;
        });
      }, 200);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoProgress(0);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Handle Video Upload Simulation
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUploading(true);
      setVideoProgress(0);
      const interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setVideoUploading(false);
            setVideoFile(file.name);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!companyName) {
      tempErrors.companyName = "Company name is required";
    }
    if (!companyEmail) {
      tempErrors.companyEmail = "Company email is required";
    } else if (!/\S+@\S+\.\S+/.test(companyEmail)) {
      tempErrors.companyEmail = "Email is invalid";
    }
    if (!contactInfo) {
      tempErrors.contactInfo = "Contact info is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const { apiClient } = await import("@/lib/api/api-client");
      const updatedUser = await apiClient.post<any>("/users/company", {
        companyName,
        companyWebsite: companyEmail ? `https://${companyEmail.split("@")[1] || "example.com"}` : undefined,
        companyDescription: description || undefined,
      });

      // Sync Zustand auth store with employer role and company details
      const { useAuthStore } = await import("@/stores/use-auth-store");
      useAuthStore.getState().updateUser({
        role: "employer",
        companyName,
        companyDescription: description,
        ...updatedUser,
      });
      useAuthStore.getState().setRole("employer");

      setIsSuccess(true);
      toast.success("Company profile configured successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save company details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout illustrationType="office">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Saving company details..." />}
      </AnimatePresence>

      <div className="flex flex-col h-full justify-center">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              Company Details
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Tell us about your company details
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="relative">
                    {logoFile ? (
                      <div className="flex h-12 items-center justify-between px-3.5 rounded-xl border border-green-200 bg-green-50/20 text-sm">
                        <span className="flex items-center gap-2 text-green-600 font-semibold truncate max-w-35">
                          <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                          {logoFile}
                        </span>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 :bg-red-950/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ) : logoUploading ? (
                      <div className="flex h-12 flex-col justify-center px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden">
                        <span className="text-xs text-slate-500 font-semibold mb-1">
                          Uploading Logo... {logoProgress}%
                        </span>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-linear-to-r from-[#52CEDE] to-[#0A54B1]"
                            style={{ width: `${logoProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-400 text-sm text-left hover:border-[#0A54B1] hover:bg-slate-50 :bg-slate-800 hover:text-slate-600 :text-slate-300 transition-all cursor-pointer"
                      >
                        <span className="truncate">Select logo file...</span>
                        <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Upload A Video <span className="text-[10px] text-slate-400 font-normal lowercase">(if have any)</span>
                </label>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoChange}
                  accept="video/*"
                  className="hidden"
                />
                <div className="relative">
                  {videoFile ? (
                    <div className="flex h-12 items-center justify-between px-3.5 rounded-xl border border-green-200 bg-green-50/20 text-sm">
                      <span className="flex items-center gap-2 text-green-600 font-semibold truncate max-w-80">
                        <Video className="w-4.5 h-4.5 shrink-0" />
                        {videoFile}
                      </span>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 :bg-red-950/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ) : videoUploading ? (
                    <div className="flex h-12 flex-col justify-center px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden">
                      <span className="text-xs text-slate-500 font-semibold mb-1">
                        Uploading Video... {videoProgress}%
                      </span>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-linear-to-r from-[#52CEDE] to-[#0A54B1]"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-400 text-sm text-left hover:border-[#0A54B1] hover:bg-slate-50 :bg-slate-800 hover:text-slate-600 :text-slate-300 transition-all cursor-pointer"
                    >
                      <span>upload a video</span>
                      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  )}
                </div>
              </div>

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
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500 " />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Onboarding Complete!
            </h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Your company details have been successfully saved. Let&apos;s go to your new workspace.
            </p>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full h-12 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-md hover:opacity-95 transition-all"
              >
                Go to Employer Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/job-portal"
                className="inline-flex items-center justify-center gap-2 w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-all"
              >
                Post a Job Now
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
