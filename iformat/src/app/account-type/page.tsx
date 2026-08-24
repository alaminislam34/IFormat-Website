"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Building2, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RoleSelectionCard } from "@/features/auth/components/role-selection-card";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/stores/use-auth-store";

type RoleType = "candidate" | "employer";

export default function AccountTypePage() {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.setRole);
  const [selectedRole, setSelectedRole] = useState<RoleType>("candidate");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      const roleUpper = selectedRole.toUpperCase() as "CANDIDATE" | "EMPLOYER";
      const { apiClient } = await import("@/lib/api/api-client");
      await apiClient.patch("/users/role", { role: roleUpper });
      setRole(selectedRole);

      if (selectedRole === "candidate") {
        router.push("/job-portal");
      } else {
        router.push("/company-details");
      }
    } catch {
      setRole(selectedRole);
      if (selectedRole === "candidate") {
        router.push("/job-portal");
      } else {
        router.push("/company-details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout illustrationType="office">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen
            message={
              selectedRole === "candidate"
                ? "Setting up candidate profile..."
                : "Redirecting to company onboarding..."
            }
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Join as a Candidate or Employer
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Select the account type that best matches your goals to customize your experience.
        </p>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" role="radiogroup" aria-label="Account Type">
          <RoleSelectionCard
            id="candidate"
            title="I'm a Candidate"
            description="Looking for career opportunities and AI resume tools."
            icon={User}
            iconBgColor="bg-sky-50"
            iconColor="text-sky-500"
            selected={selectedRole === "candidate"}
            onSelect={(role) => setSelectedRole(role)}
          />

          <RoleSelectionCard
            id="employer"
            title="I'm an Employer"
            description="Looking to hire qualified talent and build strong teams."
            icon={Building2}
            iconBgColor="bg-blue-50"
            iconColor="text-[#0A54B1]"
            selected={selectedRole === "employer"}
            onSelect={(role) => setSelectedRole(role)}
          />
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full h-12 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {selectedRole === "candidate" ? "Apply as Candidate" : "Continue as Employer"}{" "}
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Footer Link */}
        <div className="flex items-center justify-center pt-6 mt-6 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#0A54B1] font-bold hover:underline ml-1"
            >
              Log in
            </Link>
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}
