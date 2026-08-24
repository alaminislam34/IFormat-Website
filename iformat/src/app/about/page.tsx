"use client";

import { About } from "@/features/landing/components/about";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between pt-16">
      <main className="flex-1 py-12">
        <About />
      </main>
      <Footer />
    </div>
  );
}
