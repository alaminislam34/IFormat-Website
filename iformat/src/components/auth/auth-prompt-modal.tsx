"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  UserPlus,
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useLogin, useRegister } from "@/hooks";
import { useAuthStore, syncAuthCookies } from "@/stores/use-auth-store";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectUrl?: string;
  onSuccess?: () => void;
  onContinueGuest?: () => void;
  perks?: string[];
}

export function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign In to Book a Free Consult",
  description = "Please sign in or create an account to book your consultation session.",
  redirectUrl = "/?consult=open",
  onSuccess,
  onContinueGuest,
}: AuthPromptModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    loginMutation.mutate(
      { email: loginEmail.trim(), password: loginPassword, rememberMe },
      {
        onSuccess: (res) => {
          if (res.user.emailVerified === false || res.requiresEmailVerification) {
            toast.info("Please verify your email address to complete sign in.");
            onClose();
            router.push(
              `/verify-otp?email=${encodeURIComponent(loginEmail.trim())}&redirect=${encodeURIComponent(
                redirectUrl
              )}`
            );
            return;
          }

          const token = res.token || res.accessToken;
          if (token) {
            setAuth(res.user, token, res.refreshToken);
            syncAuthCookies(token, res.refreshToken, res.user.role);
          }

          toast.success(`Welcome back, ${res.user.name}!`);
          onClose();

          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Invalid email or password. Please try again.";
          toast.error(msg);
        },
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName.trim() || registerName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    if (!registerEmail.trim() || !registerEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!registerPassword || registerPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    registerMutation.mutate(
      {
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      },
      {
        onSuccess: (res) => {
          try {
            localStorage.setItem(
              `otp_resend_until_${registerEmail.trim()}`,
              String(Date.now() + 60000)
            );
          } catch {}
          toast.success(`Account created! Welcome, ${res.user.name}`);
          onClose();
          router.push(
            `/verify-otp?email=${encodeURIComponent(
              registerEmail.trim()
            )}&redirect=${encodeURIComponent(redirectUrl)}`
          );
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create account. Please try again.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          {/* Backdrop Click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-7 space-y-5 my-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-sky-50 to-blue-50 border border-blue-100/80 flex items-center justify-center mx-auto shadow-xs text-[#0A54B1]">
                {tab === "signin" ? (
                  <LogIn className="w-6 h-6 text-[#0A54B1]" />
                ) : (
                  <UserPlus className="w-6 h-6 text-[#0A54B1]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {tab === "signin" ? title : "Create an Account"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {tab === "signin" ? description : "Register in seconds to book your free career consultation."}
              </p>
            </div>

            {/* Segmented Tab Switch */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === "signin"
                    ? "bg-white text-[#0A54B1] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === "signup"
                    ? "bg-white text-[#0A54B1] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Create Account
              </button>
            </div>

            {/* Sign In Form */}
            {tab === "signin" && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      onClick={onClose}
                      className="text-[11px] font-bold text-[#0A54B1] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#0A54B1] accent-[#0A54B1]"
                    />
                    <span className="text-xs text-slate-600 font-medium">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-11 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In & Continue</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-1.5 items-center">
                  <div className="grow border-t border-slate-100"></div>
                  <span className="shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    or
                  </span>
                  <div className="grow border-t border-slate-100"></div>
                </div>

                <GoogleAuthButton label="Continue with Google" />

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("signup")}
                      className="font-bold text-[#0A54B1] hover:underline cursor-pointer"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {tab === "signup" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full h-11 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Free Account</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-1.5 items-center">
                  <div className="grow border-t border-slate-100"></div>
                  <span className="shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    or
                  </span>
                  <div className="grow border-t border-slate-100"></div>
                </div>

                <GoogleAuthButton label="Sign up with Google" />

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("signin")}
                      className="font-bold text-[#0A54B1] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            )}
            {onContinueGuest && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onContinueGuest();
                  }}
                  className="w-full py-1 text-xs text-slate-500 hover:text-[#0A54B1] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Try Demo Preview Without Login</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
