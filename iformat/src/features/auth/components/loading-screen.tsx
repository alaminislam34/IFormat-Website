"use client";

import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Processing..." }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          {/* Inner pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-linear-to-tr from-[#52CEDE] to-[#0A54B1] opacity-20 blur-md"
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Double ring spinners */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-t-[#52CEDE] border-r-[#52CEDE]/20 border-b-[#0A54B1] border-l-[#0A54B1]/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute inset-2 rounded-full border-4 border-t-[#0A54B1]/40 border-r-transparent border-b-[#52CEDE]/40 border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Text message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold text-slate-800 mt-2 text-center tracking-wide"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
}
