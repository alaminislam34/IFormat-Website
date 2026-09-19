"use client";

import { Play } from "lucide-react";
import { TrustedBrands } from "./trusted-brands";

export function Stats() {
  return (
    <div className="bg-slate-50 overflow-hidden">
      {/* Video Section */}
      <section className="relative h-[60vh] bg-[#0f172a] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[#0f172a]/70"></div>
        
        <button className="relative z-10 w-20 h-20 bg-transparent border-4 border-brand-cyan rounded-full flex items-center justify-center hover:bg-brand-cyan/20 hover:scale-110 transition-all group cursor-pointer">
          <Play className="w-8 h-8 text-brand-cyan ml-2 group-hover:text-white transition-colors" fill="currentColor" />
        </button>
      </section>

      <TrustedBrands />
    </div>
  );
}
