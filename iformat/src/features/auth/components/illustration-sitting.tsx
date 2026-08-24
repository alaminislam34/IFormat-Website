"use client";

import { motion } from "framer-motion";

export function IllustrationSitting() {
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
        <defs>
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="swoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52CEDE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0A54B1" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="cactusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#ffedd5" />
          </linearGradient>
          <linearGradient id="bodyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A54B1" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* --- Background Circle and Curves --- */}
        <motion.circle
          cx="400"
          cy="300"
          r="180"
          fill="url(#circleGrad)"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1 }}
        />

        {/* Cityscape / Abstract Skyline Silhouette inside Circle */}
        <g opacity="0.3">
          <path
            d="M260 380 L260 330 L285 330 L285 350 L310 350 L310 320 L330 320 L330 380 Z"
            fill="#0A54B1"
          />
          <path
            d="M330 380 L330 340 L350 340 L350 310 L370 310 L370 350 L390 350 L390 380 Z"
            fill="#0A54B1"
          />
          <path
            d="M480 380 L480 320 L505 320 L505 340 L520 340 L520 315 L540 315 L540 380 Z"
            fill="#52CEDE"
          />
        </g>

        {/* Swooping Curtain / Wave from top-left */}
        <motion.path
          d="M100 100 Q 250 150 250 250 T 400 200 T 550 280"
          stroke="url(#swoopGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M140 80 Q 280 130 280 230 T 430 180 T 580 260"
          stroke="url(#swoopGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
        />

        {/* --- Desk --- */}
        <g>
          {/* Desk Legs */}
          <rect x="230" y="420" width="12" height="130" rx="3" fill="#e2e8f0" />
          <rect x="520" y="420" width="12" height="130" rx="3" fill="#e2e8f0" />
          {/* Desk Shadow */}
          <ellipse cx="380" cy="545" rx="180" ry="10" fill="#cbd5e1" opacity="0.5" />
          {/* Desk Top */}
          <rect x="210" y="410" width="345" height="14" rx="4" fill="url(#woodGrad)" stroke="#ffedd5" strokeWidth="2" />
        </g>

        {/* --- Desk Accessories --- */}
        {/* Computer Monitor */}
        <g>
          {/* Base & Stand */}
          <rect x="360" y="405" width="40" height="8" rx="2" fill="#94a3b8" />
          <path d="M375 405 L375 340 L385 340 L385 405 Z" fill="#cbd5e1" />
          {/* Monitor Screen Frame */}
          <rect x="310" y="270" width="140" height="80" rx="6" fill="#1e293b" />
          {/* Inner Screen */}
          <rect x="316" y="276" width="128" height="68" rx="2" fill="#0f172a" />
          {/* Code lines mock in screen */}
          <rect x="324" y="284" width="60" height="4" rx="1" fill="#22c55e" opacity="0.8" />
          <rect x="324" y="292" width="80" height="4" rx="1" fill="#3b82f6" opacity="0.8" />
          <rect x="324" y="300" width="45" height="4" rx="1" fill="#a855f7" opacity="0.8" />
          <rect x="334" y="308" width="65" height="4" rx="1" fill="#eab308" opacity="0.8" />
          {/* Sticky note on monitor */}
          <rect x="424" y="280" width="12" height="12" fill="#fef08a" transform="rotate(-5)" />
        </g>

        {/* Keyboard */}
        <rect x="340" y="402" width="65" height="4" rx="1" fill="#475569" />

        {/* Small Cactus Plant */}
        <g>
          {/* Pot */}
          <path d="M268 410 L278 410 L275 396 L271 396 Z" fill="#fdba74" />
          {/* Cactus */}
          <path d="M270 396 Q273 380 273 378 Q273 380 276 396 Z" fill="url(#cactusGrad)" />
          <path d="M268 390 Q264 388 266 384 Q268 384 271 392 Z" fill="url(#cactusGrad)" />
          <path d="M278 390 Q282 388 280 384 Q278 384 275 392 Z" fill="url(#cactusGrad)" />
        </g>

        {/* --- Character Sitting --- */}
        <g>
          {/* Chair Base & Back */}
          <path d="M495 440 L495 530 L520 530" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <path d="M465 410 L525 410" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          {/* Chair Support Star */}
          <path d="M485 530 L505 530 L495 530 L495 540 L495 530" stroke="#94a3b8" strokeWidth="4" />
          
          {/* Chair Seat cushion */}
          <rect x="440" y="390" width="85" height="15" rx="4" fill="#64748b" />
          {/* Chair Back Cushion */}
          <rect x="495" y="300" width="16" height="100" rx="6" fill="#64748b" />

          {/* Legs (crossed/sitting) */}
          <path
            d="M445 400 C430 400, 420 440, 410 470 C405 480, 400 500, 395 515 C390 528, 410 528, 412 515 L428 470 C435 450, 445 425, 455 400 Z"
            fill="#1e293b"
          />
          {/* Red/Amber Shoes */}
          <path d="M395 515 Q385 520 388 528 L404 528 Q406 520 398 515 Z" fill="#94a3b8" />

          {/* Torso & Jacket */}
          <path
            d="M440 290 C455 290, 480 290, 490 290 C495 330, 495 370, 490 392 C475 392, 445 392, 435 392 C430 370, 432 330, 440 290 Z"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          
          {/* Neck */}
          <rect x="455" y="272" width="10" height="20" rx="2" fill="#fbcfe8" />

          {/* Head & Hair */}
          <circle cx="460" cy="260" r="15" fill="#fbcfe8" />
          
          {/* Hair (Short bob with fringe, reddish-orange) */}
          <motion.path
            d="M444 260 C444 242, 476 242, 476 260 C476 264, 480 266, 478 274 C476 270, 472 274, 468 272 C463 270, 458 274, 456 272 C451 274, 446 270, 445 274 C442 266, 444 264, 444 260 Z"
            fill="#f97316"
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Eye & Smile */}
          <circle cx="454" cy="260" r="1.5" fill="#1e293b" />
          <path d="M451 265 Q453 267 455 265" stroke="#1e293b" strokeWidth="1" fill="none" />

          {/* Arms */}
          {/* Arm holding mug */}
          <path
            d="M445 300 C435 320, 415 345, 415 355 C420 355, 435 355, 445 340 C455 330, 455 315, 450 300 Z"
            fill="#fbcfe8"
          />
          {/* Mug */}
          <rect x="402" y="348" width="14" height="16" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M402 352 H398 V360 H402" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Animated Steam rising from coffee mug */}
          <motion.g
            animate={{
              y: [0, -15, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "410px 345px" }}
          >
            <path d="M407 344 Q405 336 409 330" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M411 345 Q409 339 413 333" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          </motion.g>
          
          {/* Left Arm resting on knee */}
          <path
            d="M480 300 C470 320, 450 340, 445 350 L452 355 C460 345, 480 325, 485 300 Z"
            fill="#fbcfe8"
          />
        </g>
      </svg>
    </div>
  );
}
