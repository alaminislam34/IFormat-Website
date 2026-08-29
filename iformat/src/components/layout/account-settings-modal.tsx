"use client";

import React, { useState, useEffect } from "react";
import { X, User, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { ProfileSettingsTab } from "./settings/profile-settings-tab";
import { SecuritySettingsTab } from "./settings/security-settings-tab";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (!user) return null;

  const initial = (name || user.email || "U").charAt(0).toUpperCase();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const updated = await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });

      updateUser({
        name: updated?.name || name.trim(),
        phone: updated?.phone || phone.trim(),
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

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
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password. Check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-base bg-linear-to-r from-[#52CEDE] to-[#0A54B1] shadow-sm">
                  {initial}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    Account & Profile Settings
                  </h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white px-6 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`py-3.5 pr-6 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
                  activeTab === "profile"
                    ? "border-[#0A54B1] text-[#0A54B1]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="w-4 h-4" /> Personal Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`py-3.5 px-6 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
                  activeTab === "security"
                    ? "border-[#0A54B1] text-[#0A54B1]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <KeyRound className="w-4 h-4" /> Password & Security
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-5">
              {activeTab === "profile" ? (
                <ProfileSettingsTab
                  user={user}
                  name={name}
                  setName={setName}
                  phone={phone}
                  setPhone={setPhone}
                  isSaving={isSavingProfile}
                  onSubmit={handleProfileSubmit}
                />
              ) : (
                <SecuritySettingsTab
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  isChanging={isChangingPassword}
                  onSubmit={handlePasswordSubmit}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
