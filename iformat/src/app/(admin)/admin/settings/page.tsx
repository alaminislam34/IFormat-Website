"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { apiClient } from "@/lib/api/api-client";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Contact Info State
  const [contactLocation, setContactLocation] = useState("123 Business Pkwy, Suite 400\nNew York, NY 10001");
  const [contactPhone, setContactPhone] = useState("+1 (555) 123-4567");
  const [contactEmail, setContactEmail] = useState("info@iformatbranding.com");
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Load Contact Info
  useEffect(() => {
    loadContactSettings();
  }, []);

  const loadContactSettings = async () => {
    try {
      setIsLoadingContact(true);
      const res = await apiClient.get<any>("/settings/contact");
      const data = res?.data || res;
      if (data) {
        if (data.location) setContactLocation(data.location);
        if (data.phone) setContactPhone(data.phone);
        if (data.email) setContactEmail(data.email);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingContact(false);
    }
  };

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingContact(true);
      await apiClient.patch("/settings/contact", {
        location: contactLocation.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
      });
      toast.success("Website contact information updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update contact info.");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current administrator password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Administrator password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password. Please verify current password.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System & Settings
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage administrator credentials, public contact information, and incoming inquiries.
        </p>
      </div>

      {/* SECTION 1: Public Contact Information Settings */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Website Contact Information</h3>
              <p className="text-xs text-slate-500">
                These details are shown dynamically in the "Contact Us" section on the public website.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadContactSettings}
            disabled={isLoadingContact}
            className="text-xs text-slate-600 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingContact ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <form onSubmit={handleSaveContactInfo} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                Contact Number / WhatsApp
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@iformatbranding.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              Office Location / Address
            </label>
            <textarea
              rows={2}
              required
              value={contactLocation}
              onChange={(e) => setContactLocation(e.target.value)}
              placeholder="123 Business Pkwy, Suite 400, New York, NY 10001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingContact}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-xs cursor-pointer"
            >
              {isSavingContact ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Contact Details"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Contact Form Inquiries Management Quick Card */}
      <div className="bg-linear-to-r from-sky-50/80 via-white to-indigo-50/50 border border-sky-100/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Contact Us Inquiries Management
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                Dedicated Page
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              All messages submitted through the public Contact Us form are managed in a dedicated inquiries console with real-time status filtering, quick phone calling, and email replies.
            </p>
          </div>
        </div>

        <Link
          href="/admin/inquiries"
          className="h-10 px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 shadow-xs transition-colors cursor-pointer"
        >
          <span>Open Inquiries Page</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* SECTION 2.5: Homepage Media & Leadership Team Management Quick Card */}
      <div className="bg-linear-to-r from-blue-50/80 via-white to-sky-50/50 border border-blue-100/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0A54B1] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Landing Page Video & Leaders Management
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Media Center
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Upload and update the promotional vision video, headlines, and leadership team executive profiles and images shown on the public homepage.
            </p>
          </div>
        </div>

        <Link
          href="/admin/homepage"
          className="h-10 px-5 rounded-xl bg-[#0A54B1] hover:bg-[#08438e] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 shadow-xs transition-colors cursor-pointer"
        >
          <span>Manage Homepage Media</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* SECTION 3: Administrator Credentials & Password */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Administrator Profile Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xs text-white">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Admin</h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Session
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 text-xs font-semibold">
                  Admin Email
                </span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {user?.email || "admin@iformatbranding.com"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 text-xs font-semibold">
                  Authorization Role
                </span>
                <p className="font-semibold text-blue-700 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Superadmin (Full Access)
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>Protected with multi-layered token authentication and bcrypt encryption.</span>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Administrator Password</h3>
              <p className="text-xs text-slate-500">Update your master admin credentials securely</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current administrator password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold h-11 px-6 transition-all shadow-xs cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Administrator Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
