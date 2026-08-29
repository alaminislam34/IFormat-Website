"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { useVerifyOtp, useResendOtp } from "@/hooks";

import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { VerifyOtpSuccess } from "@/features/auth/components/verify-otp-success";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [codeError, setCodeError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (!email) return;
    try {
      const storedUntil = localStorage.getItem(`otp_resend_until_${email}`);
      if (storedUntil) {
        const remaining = Math.ceil((parseInt(storedUntil, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setCountdown(remaining);
          setCanResend(false);
        } else {
          setCountdown(0);
          setCanResend(true);
          localStorage.removeItem(`otp_resend_until_${email}`);
        }
      } else {
        setCountdown(0);
        setCanResend(true);
      }
    } catch (err) {
      console.error("Error reading OTP countdown from localStorage:", err);
      setCountdown(0);
      setCanResend(true);
    }
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (email) {
            try {
              localStorage.removeItem(`otp_resend_until_${email}`);
            } catch (err) {
              console.error("Error removing OTP countdown timestamp on expiry:", err);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, email]);

  const handleOtpChange = (index: number, value: string) => {
    if (codeError) setCodeError("");
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setCodeError("Please enter the complete 6-digit verification code");
      return;
    }
    if (!email) {
      toast.error("Please provide your email address");
      return;
    }

    setCodeError("");
    setIsLoading(true);
    verifyOtpMutation.mutate(
      { email, code, type: "EMAIL_VERIFICATION" },
      {
        onSuccess: () => {
          setIsLoading(false);
          setIsSuccess(true);
          toast.success("Email verified successfully!");
        },
        onError: (err) => {
          setIsLoading(false);
          setCodeError(err.message || "Invalid or expired verification code");
        },
      }
    );
  };

  const handleResend = () => {
    if (!canResend || !email) return;

    setCanResend(false);
    setCountdown(60);
    try {
      localStorage.setItem(`otp_resend_until_${email}`, String(Date.now() + 60000));
    } catch (err) {
      console.error("Error saving OTP resend cooldown to localStorage:", err);
    }

    resendOtpMutation.mutate(
      { email, type: "EMAIL_VERIFICATION" },
      {
        onSuccess: () => {
          toast.success("A new 6-digit verification code has been sent!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to resend verification code.");
          setCanResend(true);
          setCountdown(0);
          try {
            localStorage.removeItem(`otp_resend_until_${email}`);
          } catch (storageErr) {
            console.error("Error clearing OTP resend cooldown from localStorage:", storageErr);
          }
        },
      }
    );
  };

  return (
    <AuthLayout illustrationType="sitting">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Verifying your code..." />}
      </AnimatePresence>

      <div className="flex flex-col h-full justify-center">
        {!isSuccess ? (
          <VerifyOtpForm
            email={email}
            emailParam={emailParam}
            setEmail={setEmail}
            otp={otp}
            codeError={codeError}
            canResend={canResend}
            countdown={countdown}
            inputRefs={inputRefs}
            onOtpChange={handleOtpChange}
            onKeyDown={handleKeyDown}
            onVerify={handleVerify}
            onResend={handleResend}
          />
        ) : (
          <VerifyOtpSuccess />
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A54B1]" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
