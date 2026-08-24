"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations";
import { useRequestPasswordReset } from "@/hooks";

import { handleFormError } from "@/lib/handle-form-error";

export default function ForgotPasswordPage() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetMutation = useRequestPasswordReset();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    if (!agreeTerms) {
      setAgreeError("You must agree to the Terms of Use and Privacy Policy");
      return;
    }
    setAgreeError("");
    setIsLoading(true);
    setSubmittedEmail(data.email);

    resetMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setIsLoading(false);
          setIsSuccess(true);
          toast.success("Reset instructions sent to your email!");
        },
        onError: (err) => {
          setIsLoading(false);
          handleFormError(err, setError, {
            fallbackMessage: "Failed to send reset link.",
          });
        },
      }
    );
  };

  return (
    <AuthLayout illustrationType="sitting">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Sending reset instructions..." />}
      </AnimatePresence>

      <div className="flex flex-col h-full justify-center">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Reset your Password
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We&apos;ll email you instructions and a verification code to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
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
                    {...register("email")}
                    className={`flex h-12 w-full rounded-xl border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                    } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
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
                Send Reset Instructions
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
              We&apos;ve sent password reset instructions to <span className="font-semibold text-slate-800">{submittedEmail}</span>. Please follow the instructions to set your new password.
            </p>
            <Link
              href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
              className="w-full h-12 bg-[#0A54B1] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            >
              Continue to set new password <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
