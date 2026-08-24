import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Process() {
  const steps = [
    {
      num: "01",
      title: "Consultation",
      desc: "Deep dive into your career history, goals, and unique value proposition."
    },
    {
      num: "02",
      title: "Payment",
      desc: "Secure your package and gain access to our onboarding portal."
    },
    {
      num: "03",
      title: "Conduct",
      desc: "Our experts craft your materials using ATS and psychological frameworks."
    },
    {
      num: "04",
      title: "Delivery",
      desc: "Review your final materials, ready to deploy in your job search."
    }
  ];

  return (
    <section className="py-24 bg-[#0a4da6] text-white overflow-hidden relative" id="process">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-4">Our Process</h2>
            <p className="text-white/80 text-lg">
              A streamlined, transparent journey from initial contact to final delivery.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-8 left-[5%] right-[5%] h-px bg-white/20 hidden md:block"></div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <ScrollReveal key={idx} yOffset={40} delay={idx * 0.15}>
                <div className="relative z-10 h-full">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-cyan to-[#0ea5e9] flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-cyan-500/30">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
