"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Bot,
  Cpu,
  CheckCircle2,
  Sliders,
  Shield,
  Zap,
  Loader2,
  RefreshCw,
  KeyRound,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingService } from "@/services/setting.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingService.getSettings();
      if (data?.AI_MODEL_PREFERENCE) {
        setSelectedModel(data.AI_MODEL_PREFERENCE);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaved(false);

      await settingService.updateSettings({
        AI_MODEL_PREFERENCE: selectedModel,
      });

      setSaved(true);
      toast.success("AI model preference saved to system configuration!");
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
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
      const msg = err?.response?.data?.message || err?.message || "Failed to update password.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration updated and persisted to database.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform & AI Settings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure AI screening models, match thresholds, and operational parameters.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadSettings}
          disabled={loading || isSaving}
          className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Screening Configuration */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Screening Engine</h3>
              <p className="text-xs text-slate-400">Select model for candidate resume matching</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading current configuration...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {[
                  {
                    id: "gpt-4o-mini",
                    name: "GPT-4o Mini (Default)",
                    desc: "High throughput, cost-efficient candidate screening & skill extraction",
                    speed: "Fast",
                    cost: "$0.15 / 1M tokens",
                  },
                  {
                    id: "gpt-4o",
                    name: "GPT-4o Omni",
                    desc: "Deep reasoning, comprehensive executive-level candidate evaluation",
                    speed: "Standard",
                    cost: "$2.50 / 1M tokens",
                  },
                  {
                    id: "claude-3-5-sonnet",
                    name: "Claude 3.5 Sonnet",
                    desc: "Nuanced ATS keyword and semantic contextual reasoning",
                    speed: "Balanced",
                    cost: "$3.00 / 1M tokens",
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedModel === m.id
                        ? "bg-sky-950/40 border-sky-500 ring-1 ring-sky-500"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="model"
                      checked={selectedModel === m.id}
                      onChange={() => setSelectedModel(m.id)}
                      className="mt-1 text-sky-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">{m.name}</p>
                        <span className="text-[10px] font-semibold text-emerald-400">{m.speed}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">{m.cost}</p>
                    </div>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-10 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving to Database...
                  </>
                ) : (
                  "Save Model Preference"
                )}
              </Button>
            </>
          )}
        </div>

        {/* Security & System Status */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Security & Telemetry</h3>
              <p className="text-xs text-slate-400">Environment health and token policies</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Access Token Lifespan</span>
              <span className="font-bold text-white">15 minutes (HTTP-only)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Refresh Token Lifespan</span>
              <span className="font-bold text-white">7 days (Rotated)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Stripe Webhook Idempotency</span>
              <span className="font-bold text-emerald-400">Active (Deduplicated)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Database Soft Deletion</span>
              <span className="font-bold text-emerald-400">Enforced Globally</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Administrator Password Form Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Change Administrator Password</h3>
            <p className="text-xs text-slate-400">Update your master admin credentials securely</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current administrator password"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold h-10 px-6 transition-all"
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
  );
}
