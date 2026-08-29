"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations";
import { useSetNewPassword } from "@/hooks";
import { ApiError } from "@/lib/api/api-error";
import { handleFormError } from "@/lib/handle-form-error";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ResetPasswordSuccess } from "@/features/auth/components/reset-password-success";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [token, setToken] = useState(tokenParam);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
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
          <ResetPasswordForm
            token={token}
            email={email}
            setEmail={setEmail}
            code={code}
            setCode={setCode}
            emailError={emailError}
            codeError={codeError}
            agreeTerms={agreeTerms}
            setAgreeTerms={setAgreeTerms}
            agreeError={agreeError}
            register={register}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
          />
        ) : (
          <ResetPasswordSuccess />
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
