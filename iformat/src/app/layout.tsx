import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/providers/lenis-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { GlobalNavbar } from "@/components/layout/global-navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iFormat - Transform Your Professional Brand",
  description: "Craft powerful, ATS-beating resumes, optimize your personal brand, and apply for high-growth jobs with iFormat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <LenisProvider>
            <GlobalNavbar />
            {children}
            <ScrollToTop />
            <Toaster position="top-right" richColors />
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
