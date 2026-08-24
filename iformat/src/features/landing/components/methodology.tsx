import { Brain, Target, Mic2, Compass, Award, Trophy } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Methodology() {
  const methods = [
    {
      title: "Psycholinguistics & Neuro-Linguistic Programming",
      desc: "Understanding how people think and decide to build trust and influence.",
      icon: <Brain className="w-6 h-6 text-white" />
    },
    {
      title: "Technology & Digital Visibility",
      desc: "Creating the most Compliant profiles navigation to the top of recruitment and expert searches.",
      icon: <Target className="w-6 h-6 text-white" />
    },
    {
      title: "Storytelling & Positioning",
      desc: "Turning experience and expertise into stories that set you apart and boost market relevance.",
      icon: <Mic2 className="w-6 h-6 text-white" />
    },
    {
      title: "Brand Equity Development",
      desc: "Building long-term professional and business value through visibility, consistency, reputation, and stakeholder trust.",
      icon: <Compass className="w-6 h-6 text-white" />
    },
    {
      title: "Executive & Founder Branding",
      desc: "Positioning leaders as credible, visible representatives of their organizations while boosting stakeholder and customer trust and loyalty.",
      icon: <Award className="w-6 h-6 text-white" />
    },
    {
      title: "Reputation & Influence",
      desc: "Helping professionals and organizations strengthen market perception, employer reputation, and industry influence.",
      icon: <Trophy className="w-6 h-6 text-white" />
    }
  ];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden" id="methodology">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Our Brand <span className="text-[#3b82f6]">Equity Methodology</span>
            </h2>
            <p className="text-slate-600 text-lg">
              We blend cutting-edge technology with deep psychological insights to create personal brands that are both algorithm-friendly and human-compelling.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method, idx) => (
            <ScrollReveal key={idx} yOffset={40} delay={idx * 0.15}>
              <div className="bg-[#f0f7fa] rounded-3xl p-8 text-center hover:-translate-y-1 transition-transform duration-300 h-full">
                <div className="w-14 h-14 bg-[#22d3ee] rounded-xl flex items-center justify-center mb-6 mx-auto shadow-md shadow-cyan-500/20">
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{method.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {method.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
