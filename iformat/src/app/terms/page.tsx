import type { Metadata } from "next";
import { TermsView } from "@/features/legal/components/terms-view";

export const metadata: Metadata = {
  title: "Terms of Service | iFormat Personal Branding",
  description:
    "Review the terms and conditions governing the use of iFormat's job portal, AI career assistant, ATS resume builder, and personal branding services.",
  keywords: [
    "iFormat Terms",
    "Terms of Service",
    "User Agreement",
    "Job Portal Terms",
    "Career Platform Terms",
  ],
  openGraph: {
    title: "Terms of Service | iFormat Personal Branding",
    description:
      "Review the terms and conditions governing the use of iFormat's platform and services.",
    url: "https://iformatbranding.com/terms",
    siteName: "iFormat",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsView />;
}
