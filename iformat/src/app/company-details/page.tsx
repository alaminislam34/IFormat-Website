"use client";

import React, { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { toast } from "sonner";
import { CompanyDetailsForm } from "@/features/company/components/company-details-form";
import { CompanyOnboardingSuccess } from "@/features/company/components/company-onboarding-success";

export default function CompanyDetailsPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [description, setDescription] = useState("");

  // Simulated File Uploads
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{
    companyName?: string;
    companyEmail?: string;
    contactInfo?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Logo Upload Simulation
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUploading(true);
      setLogoProgress(0);
      const interval = setInterval(() => {
        setLogoProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setLogoUploading(false);
            setLogoFile(file.name);
            return 100;
          }
          return prev + 25;
        });
      }, 200);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoProgress(0);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Handle Video Upload Simulation
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUploading(true);
      setVideoProgress(0);
      const interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setVideoUploading(false);
            setVideoFile(file.name);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!companyName) {
      tempErrors.companyName = "Company name is required";
    }
    if (!companyEmail) {
      tempErrors.companyEmail = "Company email is required";
    } else if (!/\S+@\S+\.\S+/.test(companyEmail)) {
      tempErrors.companyEmail = "Email is invalid";
    }
    if (!contactInfo) {
      tempErrors.contactInfo = "Contact info is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const { apiClient } = await import("@/lib/api/api-client");
      const updatedUser = await apiClient.post<any>("/users/company", {
        companyName,
        companyWebsite: companyEmail ? `https://${companyEmail.split("@")[1] || "example.com"}` : undefined,
        companyDescription: description || undefined,
      });

      const { useAuthStore } = await import("@/stores/use-auth-store");
      useAuthStore.getState().updateUser({
        role: "employer",
        companyName,
        companyDescription: description,
        ...updatedUser,
      });
      useAuthStore.getState().setRole("employer");

      setIsSuccess(true);
      toast.success("Company profile configured successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save company details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout illustrationType="office">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Saving company details..." />}
      </AnimatePresence>

      <div className="flex flex-col h-full justify-center">
        {!isSuccess ? (
          <CompanyDetailsForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyEmail={companyEmail}
            setCompanyEmail={setCompanyEmail}
            contactInfo={contactInfo}
            setContactInfo={setContactInfo}
            description={description}
            setDescription={setDescription}
            errors={errors}
            setErrors={setErrors}
            logoFile={logoFile}
            logoUploading={logoUploading}
            logoProgress={logoProgress}
            logoInputRef={logoInputRef}
            handleLogoChange={handleLogoChange}
            removeLogo={removeLogo}
            videoFile={videoFile}
            videoUploading={videoUploading}
            videoProgress={videoProgress}
            videoInputRef={videoInputRef}
            handleVideoChange={handleVideoChange}
            removeVideo={removeVideo}
            onSubmit={handleSubmit}
          />
        ) : (
          <CompanyOnboardingSuccess />
        )}
      </div>
    </AuthLayout>
  );
}
