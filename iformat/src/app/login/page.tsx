"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { useLogin } from "@/hooks";

import { handleFormError } from "@/lib/handle-form-error";
import { syncAuthCookies, useAuthStore } from "@/stores/use-auth-store";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { user, isAuthenticated, token, refreshToken } = useAuthStore();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (token) {
        syncAuthCookies(token, refreshToken);
      }
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.replace(redirectUrl);
        return;
      }
      const role = user.role?.toLowerCase();
      let dest = "/job-portal";
      if (role === "admin") {
        dest = "/admin";
      } else if (role === "employer") {
        dest = user.companyName?.trim() ? "/dashboard" : "/company-details";
      }
      router.replace(dest);
    }
  }, [isAuthenticated, user, token, refreshToken, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    setLoadingMessage("Verifying credentials...");

    loginMutation.mutate(
      { email: data.email, password: data.password, rememberMe: data.rememberMe },
      {
        onSuccess: (res) => {
          setIsLoading(false);
          if (res.user.emailVerified === false || res.requiresEmailVerification) {
            toast.info("Please verify your email address to complete sign in. A new verification code has been sent.");
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
            return;
          }

          toast.success(`Welcome back, ${res.user.name}!`);

          if (redirectUrl && redirectUrl.startsWith("/")) {
            router.push(redirectUrl);
            return;
          }

          const role = res.user.role?.toLowerCase();
          if (role === "admin") {
            router.push("/admin");
          } else if (role === "employer") {
            if (res.user.companyName?.trim()) {
              router.push("/dashboard");
            } else {
              router.push("/company-details");
            }
          } else {
            router.push("/job-portal");
          }
        },
        onError: (err) => {
          setIsLoading(false);
          handleFormError(err, setError, {
            fallbackMessage: "Failed to sign in. Please check your email and password.",
          });
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
    window.location.href = `${apiBase}/oauth/google`;
  };

  return (
    <AuthLayout illustrationType="standing">
      <AnimatePresence>
        {isLoading && <LoadingScreen message={loadingMessage} />}
      </AnimatePresence>

      <div className="flex flex-col">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#0A54B1] font-semibold hover:underline"
          >
            Sign up
          </Link>
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
                placeholder="name@example.com"
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

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Password
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

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm py-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4.5 h-4.5 rounded border-slate-300 text-[#0A54B1] focus:ring-[#0A54B1]/20 transition-all cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[#0A54B1] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

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
              Sign in
            </button>
          <GoogleAuthButton />

          </form>
        </div>
      </AuthLayout>
    );
  }

  export default function LoginPage() {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A54B1]" />
          </div>
        }
      >
        <LoginContent />
      </React.Suspense>
    );
  }
