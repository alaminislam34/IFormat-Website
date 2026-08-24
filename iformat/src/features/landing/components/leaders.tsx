"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Leaders() {
  const leaders = [
    {
      name: "Jessica",
      role: "Founder",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Maria",
      role: "CEO",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Priya",
      role: "Head of Career Coaching",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Ian Francis",
      role: "Chief Editor",
      image: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden" id="leaders">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-slate-900">Meet the Leaders</h2>
          <p className="text-slate-600 text-lg">
            Work with industry veterans who understand the nuances of modern hiring and personal branding.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {leaders.map((leader, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              key={idx} 
              className="relative rounded-3xl overflow-hidden aspect-[3/4] group"
            >
              <Image 
                src={leader.image} 
                alt={leader.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-2xl mb-1">{leader.name}</h3>
                <p className="text-[#22d3ee] font-medium text-sm">{leader.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
