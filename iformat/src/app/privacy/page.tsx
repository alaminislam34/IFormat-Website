import type { Metadata } from "next";
import { PrivacyView } from "@/features/legal/components/privacy-view";

export const metadata: Metadata = {
  title: "Privacy Policy | iFormat Personal Branding",
  description:
    "Learn how iFormat collects, uses, encrypts, and protects your personal career data, resumes, and authentication details in compliance with GDPR and CCPA.",
  keywords: [
    "iFormat Privacy",
    "Privacy Policy",
    "Data Protection",
    "GDPR Career Portal",
    "Resume Security",
  ],
  openGraph: {
    title: "Privacy Policy | iFormat Personal Branding",
    description:
      "Learn how iFormat safeguards your personal career data and uploaded resume documents.",
    url: "https://iformatbranding.com/privacy",
    siteName: "iFormat",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
