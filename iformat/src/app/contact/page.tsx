"use client";

import { Contact } from "@/features/landing/components/contact";
import { Footer } from "@/components/layout/footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-between pt-16">
      <main className="flex-1">
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
