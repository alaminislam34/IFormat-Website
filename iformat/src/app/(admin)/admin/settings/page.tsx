"use client";

import { useState } from "react";
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Security Settings
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage your master administrator credentials and security preferences.
        </p>
      </div>

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
                  {user?.email || "devamin.bd@gmail.com"}
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
