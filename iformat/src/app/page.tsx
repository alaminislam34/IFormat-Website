import { Hero } from "@/features/landing/components/hero";
import { About } from "@/features/landing/components/about";
import { Pricing } from "@/features/landing/components/pricing";
import { Services } from "@/features/landing/components/services";
import { JobAssistantSection } from "@/features/landing/components/job-assistant-section";
import { Methodology } from "@/features/landing/components/methodology";
import { Process } from "@/features/landing/components/process";
import { Leaders } from "@/features/landing/components/leaders";
import { Stats } from "@/features/landing/components/stats";
import { Contact } from "@/features/landing/components/contact";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Hero />
      <About />
      <Pricing />
      <Services />
      <JobAssistantSection />
      <Methodology />
      <Process />
      <Leaders />
      <Stats />
      <Contact />
      <Footer />
    </main>
  );
}
