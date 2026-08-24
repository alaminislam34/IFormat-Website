"use client";

import { useEffect, useState, useRef } from "react";
import { Play } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { TrustedBrands } from "./trusted-brands";

function AnimatedCounter({ value, suffix, format }: { value: number, suffix: string, format?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let start: number | null = null;
      const duration = 2000;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        // Easing function (easeOutExpo)
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(ease * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, value]);

  return (
    <span ref={ref}>
      {format ? count.toLocaleString() : count}
      {suffix}
    </span>
  );
}

export function Stats() {
  const stats = [
    { value: 23, suffix: "+", label: "Years Experience" },
    { value: 6879, suffix: "", label: "Happy Clients", format: true },
    { value: 12, suffix: "", label: "Partners" },
    { value: 18, suffix: "", label: "Countries Served" },
  ];

  return (
    <div className="bg-slate-50 overflow-hidden">
      {/* Video Section */}
      <section className="relative h-[60vh] bg-[#0f172a] flex items-center justify-center overflow-hidden">
        {/* Placeholder for video background */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[#0f172a]/70"></div>
        
        <button className="relative z-10 w-20 h-20 bg-transparent border-4 border-[#22d3ee] rounded-full flex items-center justify-center hover:bg-[#22d3ee]/20 hover:scale-110 transition-all group">
          <Play className="w-8 h-8 text-[#22d3ee] ml-2 group-hover:text-white transition-colors" fill="currentColor" />
        </button>
      </section>

      {/* Trusted By Section */}
      <TrustedBrands />

      {/* Stats Cards Section */}
      <section className="pb-24 max-w-7xl mx-auto px-8 relative z-20 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={idx} 
              className="bg-white rounded-3xl p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100"
            >
              <div className="text-4xl md:text-5xl font-black text-[#3b82f6] mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} format={stat.format} />
              </div>
              <div className="text-slate-500 font-medium text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
