"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations";
import { useSetNewPassword } from "@/hooks";

import { ApiError } from "@/lib/api/api-error";
import { handleFormError } from "@/lib/handle-form-error";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [token, setToken] = useState(tokenParam);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const setNewPasswordMutation = useSetNewPassword();

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [tokenParam, emailParam]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token && (!email.trim() || !/\S+@\S+\.\S+/.test(email))) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!token && (!code.trim() || code.trim().length !== 6)) {
      setCodeError("Please enter the 6-digit reset code");
      return;
    }
    if (!agreeTerms) {
      setAgreeError("You must agree to the Terms of Use and Privacy Policy");
      return;
    }

    setEmailError("");
    setCodeError("");
    setAgreeError("");
    setIsLoading(true);

    setNewPasswordMutation.mutate(
      {
        token: token || undefined,
        email: email ? email.trim() : undefined,
        code: code ? code.trim() : undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          setIsSuccess(true);
          toast.success("Password has been reset successfully!");
        },
        onError: (err) => {
          setIsLoading(false);
          if (err instanceof ApiError) {
            const fieldErrors = err.getFieldErrors();
            if (fieldErrors.code) {
              setCodeError(fieldErrors.code);
              return;
            }
            if (fieldErrors.email) {
              setEmailError(fieldErrors.email);
              return;
            }
          }
          handleFormError(err, setError, {
            fallbackMessage: "Failed to update password. Link or code may be invalid.",
          });
        },
      }
    );
  };

  return (
    <AuthLayout illustrationType="sitting">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Updating your password..." />}
      </AnimatePresence>

      <div className="flex flex-col h-full justify-center">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Create new password
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your new password must be at least 6 characters long.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* If no token was in query URL, ask for Email + 6-digit Reset Code */}
              {!token && (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        className={`flex h-12 w-full rounded-xl border ${
                          emailError
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                        } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="code"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >
                      6-Digit Reset Code
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <input
                        id="code"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.replace(/\D/g, ""));
                          if (codeError) setCodeError("");
                        }}
                        className={`flex h-12 w-full rounded-xl border ${
                          codeError
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                        } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm tracking-widest font-mono text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                      />
                    </div>
                    {codeError && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{codeError}</p>
                    )}
                  </div>
                </>
              )}

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    {...register("password")}
                    className={`flex h-12 w-full rounded-xl border ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                    } bg-slate-50/50 px-3.5 pl-10 pr-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    {...register("confirmPassword")}
                    className={`flex h-12 w-full rounded-xl border ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                    } bg-slate-50/50 px-3.5 pl-10 pr-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (agreeError) setAgreeError("");
                    }}
                    className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-[#0A54B1] focus:ring-[#0A54B1]/20 transition-all cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-800 leading-snug transition-colors">
                    I agree to the{" "}
                    <Link href="#" className="text-[#0A54B1] font-semibold hover:underline">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[#0A54B1] font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {agreeError && (
                  <p className="text-xs text-red-500 mt-1 font-medium ml-7">{agreeError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 mt-2 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
              >
                Update Password
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0A54B1] hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Password reset successful</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full h-12 bg-[#0A54B1] text-white text-sm font-bold rounded-xl flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            >
              Back to login
            </button>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A54B1]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
