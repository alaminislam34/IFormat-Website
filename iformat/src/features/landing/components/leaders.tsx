"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";

export function Leaders() {
  const leaders = [
    {
      name: "Jessica",
      role: "Founder",
      image: "/leaders/Jessica - Founder.png",
    },
    {
      name: "Maria",
      role: "CEO",
      image: "/leaders/Maria - CEO.png",
    },
    {
      name: "Priya",
      role: "Head of Career Coaching",
      image: "/leaders/Priya - Head of Career Coaching.png",
    },
    {
      name: "Ian Francis",
      role: "Chief Editor",
      image: "/leaders/Ian - Chief Editor.png",
    },
    {
      name: "Tarryn",
      role: "Head of Business Branding",
      image: "/leaders/Tarryn - Head of Business Branding.png",
    },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden" id="leaders">
      <div className="max-w-360 mx-auto w-11/12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            title="Meet the Leaders"
            description="Work with industry veterans who understand the nuances of modern hiring and personal branding."
          />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {leaders.map((leader, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={idx} 
              className="relative rounded-3xl overflow-hidden aspect-3/4 group shadow-md"
            >
              <Image 
                src={leader.image} 
                alt={leader.name}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/95 via-[#0f172a]/30 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-xl sm:text-2xl mb-1">{leader.name}</h3>
                <p className="text-brand-cyan font-medium text-xs sm:text-sm leading-tight">{leader.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
