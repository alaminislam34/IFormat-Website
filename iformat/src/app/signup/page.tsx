"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { signupSchema, SignupFormData } from "@/lib/validations";
import { useRegister } from "@/hooks";
import { handleFormError } from "@/lib/handle-form-error";
import { useAuthStore } from "@/stores/use-auth-store";

import { SignupFormFields } from "@/features/auth/components/signup-form-fields";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { user, isAuthenticated } = useAuthStore();
  const registerMutation = useRegister();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.replace(redirectUrl);
        return;
      }
      const dest = user.role?.toUpperCase() === "ADMIN" ? "/admin" : "/job-portal";
      router.replace(dest);
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      agreeTerms: false,
      agreeMarketing: false,
    },
  });

  const onSubmit = (data: SignupFormData) => {
    setIsLoading(true);
    setLoadingMessage("Creating your account...");

    registerMutation.mutate(
      {
        name: data.fullName,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (res) => {
          setIsLoading(false);
          try {
            localStorage.setItem(`otp_resend_until_${data.email}`, String(Date.now() + 60000));
          } catch {}
          toast.success(`Account created! Welcome, ${res.user.name}`);
          const verifyUrl = `/verify-otp?email=${encodeURIComponent(data.email)}${
            redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ""
          }`;
          router.push(verifyUrl);
        },
        onError: (err) => {
          setIsLoading(false);
          handleFormError(err, setError, {
            fieldAliasMap: { name: "fullName" },
            fallbackMessage: "Failed to create account. Please try again.",
          });
        },
      }
    );
  };

  return (
    <AuthLayout illustrationType="standing">
      <AnimatePresence>
        {isLoading && <LoadingScreen message={loadingMessage} />}
      </AnimatePresence>

      <div className="flex flex-col">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Create your account.
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Already have an account?{" "}
          <Link
            href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
            className="text-[#0A54B1] font-semibold hover:underline"
          >
            Login here
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SignupFormFields register={register} errors={errors} watch={watch} />

          <div className="relative flex py-3 items-center">
            <div className="grow border-t border-slate-100"></div>
            <span className="shrink mx-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              or
            </span>
            <div className="grow border-t border-slate-100"></div>
          </div>
          <button
            type="submit"
            className="w-full h-12 mt-2 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            Create an account
          </button>
          <GoogleAuthButton />
        </form>
      </div>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A54B1]" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
