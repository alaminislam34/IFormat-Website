"use client";

import { motion } from "framer-motion";

export function IllustrationStanding() {
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-100 lg:min-h-125">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-[#52CEDE]/10 via-transparent to-transparent pointer-events-none" />

      <svg
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-162.5 h-auto drop-shadow-xl"
      >
        {/* Decorative Grid Lines */}
        <defs>
          <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52CEDE" />
            <stop offset="100%" stopColor="#0A54B1" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#52CEDE" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="plantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* --- Floating User Profile Card --- */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.8, delay: 0.2 },
          }}
        >
          {/* Card Base */}
          <rect
            x="120"
            y="70"
            width="200"
            height="260"
            rx="16"
            fill="#eff6ff"
            stroke="#dbeafe"
            strokeWidth="2"
          />
          {/* Card Header Avatar */}
          <circle cx="220" cy="140" r="30" fill="url(#avatarGrad)" />
          {/* Mock Profile Icon Head & Shoulders inside circle */}
          <circle cx="220" cy="132" r="12" fill="#94a3b8" />
          <path
            d="M202 154 C202 145, 238 145, 238 154 L238 156 L202 156 Z"
            fill="#94a3b8"
          />

          {/* Skeleton Lines representing data fields */}
          <rect x="150" y="195" width="140" height="10" rx="5" fill="#dbeafe" />
          <rect x="150" y="215" width="140" height="10" rx="5" fill="#dbeafe" />
          <rect x="150" y="235" width="140" height="10" rx="5" fill="#dbeafe" />
          
          <circle cx="160" cy="275" r="5" fill="#93c5fd" />
          <circle cx="175" cy="275" r="5" fill="#93c5fd" />
          <circle cx="190" cy="275" r="5" fill="#93c5fd" />
          <rect x="220" y="270" width="70" height="10" rx="5" fill="#bfdbfe" />
        </motion.g>

        {/* --- Plant --- */}
        <motion.g
          initial={{ rotate: -2 }}
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "110px 520px" }}
        >
          {/* Leaves */}
          <path
            d="M110 520 C90 440, 110 380, 110 340 C110 380, 130 440, 110 520 Z"
            fill="url(#plantGrad)"
            opacity="0.8"
          />
          <path
            d="M110 520 C70 460, 80 400, 75 360 C90 400, 120 460, 110 520 Z"
            fill="url(#plantGrad)"
            opacity="0.6"
          />
          <path
            d="M110 520 C140 460, 130 400, 135 360 C120 400, 100 460, 110 520 Z"
            fill="url(#plantGrad)"
            opacity="0.7"
          />
          
          {/* Center stems */}
          <path d="M110 520 L110 350" stroke="#60a5fa" strokeWidth="2" />
          <path d="M110 520 L80 375" stroke="#60a5fa" strokeWidth="1.5" />
          <path d="M110 520 L130 375" stroke="#60a5fa" strokeWidth="1.5" />

          {/* Plant Pot */}
          <rect x="85" y="480" width="50" height="60" rx="4" fill="#bfdbfe" />
          <rect x="80" y="475" width="60" height="8" rx="2" fill="#93c5fd" />
        </motion.g>

        {/* --- Standing Desk --- */}
        <g>
          {/* Desk Legs (Thin modern aesthetic) */}
          <line x1="200" y1="240" x2="200" y2="540" stroke="#bfdbfe" strokeWidth="4" />
          <line x1="310" y1="240" x2="310" y2="540" stroke="#bfdbfe" strokeWidth="4" />
          <line x1="410" y1="240" x2="410" y2="540" stroke="#bfdbfe" strokeWidth="4" />

          {/* Desk Surface shadow */}
          <rect x="190" y="240" width="240" height="6" fill="#e2e8f0" />
          {/* Desk Surface */}
          <rect x="195" y="235" width="230" height="6" rx="3" fill="#eff6ff" />
        </g>

        {/* --- Laptop --- */}
        <motion.g
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Laptop Screen (Open) */}
          <path d="M225 235 L215 180 L295 180 L295 235 Z" fill="#0A54B1" />
          {/* Screen Display Inner */}
          <path d="M228 232 L219 184 L291 184 L291 232 Z" fill="#1e3a8a" />
          {/* Glow effect coming from screen */}
          <polygon points="219,184 291,184 350,235 180,235" fill="url(#screenGlow)" opacity="0.4" />
          {/* Laptop Base */}
          <path d="M210 235 L220 241 L315 241 L300 235 Z" fill="#52CEDE" />
          {/* Tech Details on Laptop */}
          <circle cx="255" cy="207" r="3" fill="#52CEDE" />
        </motion.g>

        {/* --- Character Standing --- */}
        <g>
          {/* Legs & Shoes */}
          {/* Left Leg */}
          <path
            d="M380 430 L380 520 L350 520 C345 520, 345 530, 360 530 L395 530 C400 530, 400 520, 395 520 L392 520 L392 430 Z"
            fill="#1e293b"
          />
          {/* Right Leg */}
          <path
            d="M410 430 L410 520 L385 520 C380 520, 380 530, 395 530 L430 530 C435 530, 435 520, 430 520 L422 520 L422 430 Z"
            fill="#1e293b"
          />

          {/* Shoe Highlights */}
          <path d="M350 524 C348 524, 348 528, 355 528" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M385 524 C383 524, 383 528, 390 528" stroke="#ffffff" strokeWidth="1.5" />

          {/* High-waisted Teal Pants */}
          <path
            d="M365 230 C370 230, 420 230, 425 230 C435 300, 440 370, 445 425 L415 425 L402 310 L390 310 L378 425 L348 425 C353 370, 358 300, 365 230 Z"
            fill="url(#bodyGrad)"
          />
          {/* Pant belt details or highlight */}
          <path d="M365 238 C390 240, 400 240, 425 238" stroke="#52CEDE" strokeWidth="2" />
          {/* Pocket Detail */}
          <path d="M358 310 C352 320, 358 335, 368 332" stroke="#52CEDE" strokeWidth="2" fill="none" />

          {/* Torso & Shirt */}
          <path
            d="M375 140 C385 140, 410 140, 420 140 C428 170, 430 205, 425 230 C410 230, 380 230, 368 230 C364 205, 366 170, 375 140 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {/* Sleeves */}
          {/* Right sleeve */}
          <path
            d="M418 140 L435 170 L425 178 L412 155 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Neck */}
          <rect x="391" y="122" width="12" height="20" rx="3" fill="#fbcfe8" />

          {/* Head & Hair */}
          <circle cx="397" cy="110" r="16" fill="#fbcfe8" />
          {/* Hair (Sleek light blue/silver bob cut) */}
          <motion.path
            d="M381 110 C381 90, 413 90, 413 110 C413 114, 418 116, 415 125 C413 120, 411 126, 407 124 C402 122, 397 126, 395 124 C390 126, 385 120, 383 125 C380 116, 381 114, 381 110 Z"
            fill="#dbeafe"
            animate={{ y: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Facial Features (Minimalist eye/mouth) */}
          <circle cx="392" cy="110" r="1.5" fill="#1e293b" />
          <path d="M388 116 Q391 118 393 116" stroke="#1e293b" strokeWidth="1" fill="none" />

          {/* Arm resting on desk */}
          {/* Left Arm extended towards keyboard */}
          <path
            d="M375 145 C345 170, 300 220, 270 230 C280 232, 290 232, 305 230 C330 220, 365 180, 375 160 Z"
            fill="#fbcfe8"
          />
          {/* Right Arm extended towards keyboard */}
          <path
            d="M410 145 C380 170, 340 220, 305 228 L308 233 C340 225, 385 175, 415 155 Z"
            fill="#fbcfe8"
          />

          {/* Hands Typing */}
          <circle cx="270" cy="229" r="4" fill="#fbcfe8" />
          <circle cx="306" cy="229" r="4" fill="#fbcfe8" />
        </g>
      </svg>
    </div>
  );
}
