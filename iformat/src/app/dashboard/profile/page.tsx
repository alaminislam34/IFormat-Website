"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Loader2,
  Calendar,
  CreditCard,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Building2,
  Globe,
  Video,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { ProfileSkeleton } from "@/features/dashboard/components/profile-skeleton";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/api-client";
import { CompanyVideoPlayer } from "@/features/company/components/company-video-player";

export default function ProfileDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; server?: string }>({});

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    server?: string;
  }>({});

  // Company Branding State (for employers)
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [companyVideoUrl, setCompanyVideoUrl] = useState<string | null>(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const videoFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard/profile");
      return;
    }

    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      if (user.companyName) setCompanyName(user.companyName);
      if (user.companyWebsite) setCompanyWebsite(user.companyWebsite);
      if (user.companyDescription) setCompanyDescription(user.companyDescription);
      if (user.companyLogoUrl) setCompanyLogoUrl(user.companyLogoUrl);
      if (user.companyVideoUrl) setCompanyVideoUrl(user.companyVideoUrl);
    }
  }, [user, isAuthenticated, router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<any>("/upload/media", formData);
      const url = res?.data?.url || res?.url;

      if (!url) throw new Error("Failed to get uploaded logo URL");

      setCompanyLogoUrl(url);

      const role = user?.role?.toUpperCase();
      const isEmp = role === "EMPLOYER";

      if (isEmp) {
        await apiClient.post("/users/company", {
          companyName: companyName || user?.companyName || user?.name || "Company",
          companyLogoUrl: url,
          companyWebsite: companyWebsite || user?.companyWebsite || undefined,
          companyDescription: companyDescription || user?.companyDescription || undefined,
          companyVideoUrl: companyVideoUrl || user?.companyVideoUrl || undefined,
        });
        updateUser({ companyLogoUrl: url });
        toast.success("Company logo updated successfully!");
      } else {
        await userService.updateProfile({ avatarUrl: url });
        updateUser({ avatarUrl: url });
        toast.success("Profile avatar updated successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload logo image");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 50MB");
      return;
    }

    try {
      setIsUploadingVideo(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<any>("/upload/media", formData);
      const url = res?.data?.url || res?.url;

      if (!url) throw new Error("Failed to get uploaded video URL");

      setCompanyVideoUrl(url);
      await apiClient.post("/users/company", {
        companyName: companyName || user?.companyName || user?.name || "Company",
        companyLogoUrl: companyLogoUrl || user?.companyLogoUrl || undefined,
        companyWebsite: companyWebsite || user?.companyWebsite || undefined,
        companyDescription: companyDescription || user?.companyDescription || undefined,
        companyVideoUrl: url,
      });
      updateUser({ companyVideoUrl: url });
      toast.success("Company spotlight video updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload company video");
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setCompanyLogoUrl(null);
      await apiClient.post("/users/company", {
        companyName: companyName || user?.companyName || user?.name || "Company",
        companyLogoUrl: null,
        companyWebsite: companyWebsite || user?.companyWebsite || undefined,
        companyDescription: companyDescription || user?.companyDescription || undefined,
        companyVideoUrl: companyVideoUrl || user?.companyVideoUrl || undefined,
      });
      updateUser({ companyLogoUrl: null });
      toast.success("Company logo removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove logo");
    }
  };

  const handleRemoveVideo = async () => {
    try {
      setCompanyVideoUrl(null);
      await apiClient.post("/users/company", {
        companyName: companyName || user?.companyName || user?.name || "Company",
        companyLogoUrl: companyLogoUrl || user?.companyLogoUrl || undefined,
        companyWebsite: companyWebsite || user?.companyWebsite || undefined,
        companyDescription: companyDescription || user?.companyDescription || undefined,
        companyVideoUrl: null,
      });
      updateUser({ companyVideoUrl: null });
      toast.success("Company video removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove video");
    }
  };

  const handleSaveCompanyBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    try {
      setIsSavingCompany(true);
      await apiClient.post("/users/company", {
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim() || undefined,
        companyDescription: companyDescription.trim() || undefined,
        companyLogoUrl: companyLogoUrl || undefined,
        companyVideoUrl: companyVideoUrl || undefined,
      });
      updateUser({
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim() || undefined,
        companyDescription: companyDescription.trim() || undefined,
        companyLogoUrl: companyLogoUrl || undefined,
        companyVideoUrl: companyVideoUrl || undefined,
      });
      toast.success("Company branding updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save company branding");
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Inline validation — no toast
    if (!name.trim()) {
      setProfileErrors({ name: "Full name is required." });
      return;
    }
    setProfileErrors({});

    try {
      setIsSavingProfile(true);
      const updated = await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });

      updateUser({
        name: updated.name,
        phone: updated.phone,
      });

      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      setProfileErrors({ server: err?.message || "Failed to update profile details." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Inline validation — no toast
    const errs: typeof passwordErrors = {};
    if (!currentPassword) errs.currentPassword = "Current password is required.";
    if (newPassword.length < 8) errs.newPassword = "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match.";

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});

    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordErrors({ server: err?.message || "Failed to change password. Check your current password." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  const role = user.role?.toUpperCase() || "CANDIDATE";
  const isAdmin = role === "ADMIN";
  const isEmployer = role === "EMPLOYER";
  const roleLabel = isAdmin ? "Administrator" : isEmployer ? "Employer" : "Candidate";
  const initial = (name || user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="py-8 p-6 relative selection:bg-sky-100 selection:text-sky-900">
      <div className="space-y-8 relative z-10">
          {/* Header Navigation & Title */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0A54B1] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Profile & Account Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Manage your personal information, credentials, and account security preferences.
                </p>
              </div>

              {/* Status indicator badge */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700">Account Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Overview Hero Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-sky-50/50 to-transparent pointer-events-none hidden sm:block" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] shadow-md shadow-[#0A54B1]/20 overflow-hidden border border-slate-200/50">
                    {(isEmployer ? (companyLogoUrl || user.companyLogoUrl) : (user.avatarUrl || user.avatar)) ? (
                      <img
                        src={(isEmployer ? (companyLogoUrl || user.companyLogoUrl) : (user.avatarUrl || user.avatar))!}
                        alt="Logo"
                        className="w-full h-full object-contain p-2 bg-white"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    title={isEmployer ? "Upload or change company logo" : "Upload avatar"}
                    className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A54B1]" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {name || user.name || "My Account"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[#0A54B1] text-[11px] font-extrabold uppercase tracking-wide">
                      {roleLabel}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">{user.email}</p>
                </div>
              </div>

              {/* Verification & Meta badge */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                {user.emailVerified ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Account</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Pending Verification</span>
                  </div>
                )}
                <span className="text-[11px] text-slate-400 font-semibold px-1">
                  iFormat Certified Member
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid: 2 Columns (Forms + Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Details Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0A54B1] flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Personal Information</h3>
                    <p className="text-xs text-slate-500">
                      Update your basic profile credentials and contact details.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setProfileErrors({}); }}
                          placeholder="Your full name"
                          aria-invalid={!!profileErrors.name}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
                            profileErrors.name ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                          }`}
                        />
                      </div>
                      {profileErrors.name && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
                          <span>⚠</span> {profileErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Address (Read-only) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Linked identity email cannot be modified.
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {profileErrors.server && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {profileErrors.server}
                    </div>
                  )}
                  <div className="pt-3 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 h-11 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Changes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" /> Save Profile Details
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Employer Company Profile & Branding Card */}
              {isEmployer && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0A54B1] flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          Company Profile & Branding
                        </h3>
                        <p className="text-xs text-slate-500">
                          Manage your business logo, spotlight culture video, and public company details.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/company-details"
                      className="text-xs font-bold text-[#0A54B1] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Full Settings</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <form onSubmit={handleSaveCompanyBranding} className="space-y-6">
                    {/* Company Logo Section */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Company Logo
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          {companyLogoUrl ? (
                            <img
                              src={companyLogoUrl}
                              alt="Company logo preview"
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-xl font-black text-slate-400">
                              {initial}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            {companyLogoUrl ? "Custom Logo Active" : "No Logo Uploaded"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Recommended: PNG, JPG, or SVG with square or horizontal aspect ratio (max 5MB).
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              disabled={isUploadingLogo}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              {isUploadingLogo ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A54B1]" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>{companyLogoUrl ? "Change Logo" : "Upload Logo"}</span>
                            </button>
                            {companyLogoUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Company Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Company Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Acme Corporation"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                          />
                        </div>
                      </div>

                      {/* Company Website */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Company Website
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Company Description
                      </label>
                      <textarea
                        rows={3}
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Tell candidates what makes your company unique..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
                      />
                    </div>

                    {/* Company Spotlight Video Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Company Spotlight Video
                        </label>
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </div>

                      {companyVideoUrl ? (
                        <div className="space-y-3">
                          <CompanyVideoPlayer src={companyVideoUrl} title="Company Culture Video" />
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Video active on public job postings
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => videoFileInputRef.current?.click()}
                                disabled={isUploadingVideo}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                {isUploadingVideo ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A54B1]" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5" />
                                )}
                                <span>Change Video</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveVideo}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0A54B1] flex items-center justify-center">
                            <Video className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Showcase your office and culture to top candidates
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-sm">
                            Upload a brief video tour or founder introduction (MP4, WebM, up to 50MB).
                          </p>
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            disabled={isUploadingVideo}
                            className="mt-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0A54B1] hover:bg-sky-50 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                          >
                            {isUploadingVideo ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>Upload Spotlight Video</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingCompany}
                        className="px-6 h-11 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                      >
                        {isSavingCompany ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Branding...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" /> Save Company Branding
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password & Security Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Password & Security</h3>
                    <p className="text-xs text-slate-500">
                      Ensure your account remains protected with a strong unique password.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors({}); }}
                        placeholder="Enter current password"
                        aria-invalid={!!passwordErrors.currentPassword}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
                          passwordErrors.currentPassword ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
                        <span>⚠</span> {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors({}); }}
                          placeholder="At least 8 characters"
                          aria-invalid={!!passwordErrors.newPassword}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
                            passwordErrors.newPassword ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword ? (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
                          <span>⚠</span> {passwordErrors.newPassword}
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] text-slate-400">Min. 8 characters.</p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors({}); }}
                          placeholder="Re-enter new password"
                          aria-invalid={!!passwordErrors.confirmPassword}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
                            passwordErrors.confirmPassword ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
                          <span>⚠</span> {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Server-side error banner for password form */}
                  {passwordErrors.server && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {passwordErrors.server}
                    </div>
                  )}

                  <div className="pt-3 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" /> Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column / Sidebar */}
            <div className="space-y-6">
              {/* Account Quick Links */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Account Hub
                </h4>

                <div className="space-y-2">
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-100 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#0A54B1] shadow-2xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors">
                          Billing & Plans
                        </p>
                        <p className="text-[11px] text-slate-500">Manage subscriptions</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1] transition-colors" />
                  </Link>

                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-100 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#0A54B1] shadow-2xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors">
                          Career Consultations
                        </p>
                        <p className="text-[11px] text-slate-500">Review scheduled calls</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1] transition-colors" />
                  </Link>

                  {isEmployer ? (
                    <Link
                      href="/company-details"
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-100 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#0A54B1] shadow-2xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors">
                            Company Profile
                          </p>
                          <p className="text-[11px] text-slate-500">Edit business details</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1] transition-colors" />
                    </Link>
                  ) : (
                    <Link
                      href="/job-assistant"
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-100 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#0A54B1] shadow-2xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors">
                            AI Job Assistant
                          </p>
                          <p className="text-[11px] text-slate-500">CV & smart matching</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1] transition-colors" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Security Tips Card */}
              <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <h4 className="text-sm font-bold">Security Protection</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your session is encrypted with enterprise-grade token security. Always use strong, unique passwords across platforms.
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
