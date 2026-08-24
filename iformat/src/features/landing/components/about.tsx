import { Briefcase, GraduationCap, User } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function About() {
  const cards = [
    {
      title: "Business Brand Equity",
      description: "Helping founders build visibility, authority, and credibility to support business growth, partnerships, and investor engagement. Supporting organizations through restructuring and workforce transitions.",
      icon: <Briefcase className="w-6 h-6 text-white" />
    },
    {
      title: "Personal Brand Equity",
      description: "Personal Brand Equity Resume's, CVs, LinkedIn profiles, cover letters, interview coaching, executive biographies, and career positioning strategies designed to strengthen visibility and attract opportunities.",
      icon: <GraduationCap className="w-6 h-6 text-white" />
    },
    {
      title: "Our Brand Equity Methodology",
      description: "Understanding how people think, interpret information, and make decisions to create stronger perceptions of credibility, trust, and influence. Building long-term value and stakeholder trust.",
      icon: <User className="w-6 h-6 text-white" />
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              About <span className="text-[#3b82f6]">iFormat</span> Branding
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              At iFormat Branding, we see brand equity as a key asset for individuals and businesses. Whether advancing your career, attracting investors, boosting market presence, or enhancing employer reputation, perception shapes your opportunities. Our approach blends technology and psychology to build visibility, trust, and lasting brand value through strategic positioning, storytelling, ATS optimization, and digital branding.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <ScrollReveal key={idx} yOffset={40} delay={idx * 0.15}>
              <div className="bg-slate-50 rounded-3xl p-8 text-center hover:shadow-xl transition-shadow border border-slate-100 flex flex-col items-center h-full">
                <div className="w-14 h-14 bg-[#22d3ee] rounded-xl flex items-center justify-center mb-6 shadow-md shadow-cyan-500/20">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {card.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
