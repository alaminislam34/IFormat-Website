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

  // Media Uploads State
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{
    companyName?: string;
    companyEmail?: string;
    contactInfo?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Real Logo Upload
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoUploading(true);
      setLogoProgress(20);
      setLogoFile(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const { apiClient } = await import("@/lib/api/api-client");
      const res = await apiClient.post<any>("/upload/media", formData);
      const url = res?.data?.url || res?.url;

      setLogoProgress(100);
      if (url) {
        setUploadedLogoUrl(url);
        toast.success("Company logo uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload logo image.");
      removeLogo();
    } finally {
      setLogoUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setUploadedLogoUrl(null);
    setLogoProgress(0);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Handle Real Video Upload
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 50MB.");
      return;
    }

    try {
      setVideoUploading(true);
      setVideoProgress(20);
      setVideoFile(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const { apiClient } = await import("@/lib/api/api-client");
      const res = await apiClient.post<any>("/upload/media", formData);
      const url = res?.data?.url || res?.url;

      setVideoProgress(100);
      if (url) {
        setUploadedVideoUrl(url);
        toast.success("Company spotlight video uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload company video.");
      removeVideo();
    } finally {
      setVideoUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setUploadedVideoUrl(null);
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
        companyLogoUrl: uploadedLogoUrl || undefined,
        companyVideoUrl: uploadedVideoUrl || undefined,
      });

      const { useAuthStore } = await import("@/stores/use-auth-store");
      useAuthStore.getState().updateUser({
        role: "employer",
        companyName,
        companyDescription: description,
        companyLogoUrl: uploadedLogoUrl || undefined,
        companyVideoUrl: uploadedVideoUrl || undefined,
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
