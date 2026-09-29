import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";

export function Process() {
  const steps = [
    {
      num: "01",
      title: "Consultation",
      desc: "Consultation is scheduled with the potential client and invoice sent out"
    },
    {
      num: "02",
      title: "Payment",
      desc: "Once Payment is made, a meeting is set up within 24 hours"
    },
    {
      num: "03",
      title: "Conduct",
      desc: "Conduct a 45 min to 1 hour meeting with the client over Zoom with prepared questions"
    },
    {
      num: "04",
      title: "Delivery",
      desc: "Deliver a first draft within 3 days after being approved by the quality control team"
    }
  ];

  return (
    <section className="py-24 bg-[#0a4da6] text-white overflow-hidden relative" id="process">
      <div className="max-w-360 mx-auto w-11/12 relative z-10">
        <ScrollReveal yOffset={40}>
          <SectionHeader
            theme="dark"
            title="Our Process"
            description="Our process is designed to be seamless and stress-free for our clients. We provide a step-by-step guide that clearly outlines each phase of the project, ensuring that clients never feel overwhelmed or pressured."
            descriptionClassName="text-white/80 text-base md:text-lg"
            maxWidth="max-w-3xl"
            className="mb-20"
          />
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
