"use client";

import { Search, ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Hero() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("UAE");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("search", keyword.trim());
    }
    if (selectedCountry) {
      params.set("location", selectedCountry);
    }
    const query = params.toString();
    router.push(`/job-portal${query ? `?${query}` : ""}`);
  };

  return (
    <section
      className="relative overflow-hidden min-h-screen flex flex-col justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0A54B1 0%, #52CEDE 50%, #FFFFFF 100%)",
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 1.1, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-0 right-0 w-[60%] h-[80%] pointer-events-none z-1"
      >
        <Image
          src="/wave.svg"
          alt=""
          fill
          className="object-cover object-top-left"
          priority
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: "-50%" }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="absolute hidden md:block pointer-events-none z-1 right-[5%] lg:right-[10%] top-[55%] w-75 lg:w-100 xl:w-112.5 aspect-1/2"
      >
        <Image
          src="/i-icon.svg"
          alt=""
          fill
          className="object-contain"
          priority
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none z-2"></div>

      <div className="relative z-10 max-w-350 mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full">
        <div className="max-w-200">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-extrabold text-white leading-[1.1] tracking-tight mb-6 text-5xl md:text-6xl lg:text-[4.5rem]"
          >
            Building Brand <span className="text-[#0A54B1]">Equity</span>
            <br />
            for Businesses and
            <br />
            <span className="text-[#0A54B1]">Professionals</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-slate-800 text-lg md:text-xl font-medium mb-10 leading-relaxed max-w-lg"
          >
            Powered by our methodology of Merging Technology
            <br />
            with Psychology.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <button className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-900/20">
              Free Consult <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/services" className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-md border border-slate-100">
              Explore Products
            </Link>
          </motion.div>

          {/* Job Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h2 className="text-[#0A54B1] font-bold text-3xl mb-5">Find Your Next Job</h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword (e.g. Finance Manager)"
                className="flex-1 w-full h-14 min-h-14 appearance-none bg-white rounded-xl border border-slate-200 px-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1] shadow-md relative z-10"
              />
              <div className="relative w-full sm:w-36 shrink-0 z-20">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-14 min-h-14 flex items-center justify-between bg-white rounded-xl border border-slate-200 px-5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1] shadow-md transition-all cursor-pointer"
                >
                  <span className="font-medium">{selectedCountry}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-50 py-2"
                    >
                      {["UAE", "UK", "USA"].map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 cursor-pointer ${
                            selectedCountry === country ? "text-[#0A54B1] bg-blue-50/50 font-bold" : "text-slate-600"
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-14 px-8 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-90 text-white rounded-xl text-sm font-semibold shadow-lg transition-opacity shrink-0 relative z-10 cursor-pointer"
              >
                Find Job <Search className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
