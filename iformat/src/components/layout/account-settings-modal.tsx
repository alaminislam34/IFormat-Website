"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (!user || !mounted) return null;

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
        name: updated.name,
        phone: updated.phone,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile details.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
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

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
        >
          {/* Backdrop click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col z-10"
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

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 px-6 bg-white gap-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "border-[#0A54B1] text-[#0A54B1]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <User className="w-4 h-4" /> Profile Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "border-[#0A54B1] text-[#0A54B1]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <KeyRound className="w-4 h-4" /> Password & Security
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
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
                  onSubmit={handleChangePasswordSubmit}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
