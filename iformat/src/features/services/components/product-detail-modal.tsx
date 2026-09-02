"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Calendar,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServiceProduct {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  deliveryTime: string;
  image: string;
  category: string;
  badge?: string;
  tagline: string;
  description: string;
  deliverables: string[];
  audience: string;
  methodology: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ServiceProduct | null;
  onOrderNow: (product: ServiceProduct) => void;
  onBookConsultation: (product: ServiceProduct) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onOrderNow,
  onBookConsultation,
}: ProductDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !product) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        >
          {/* Backdrop click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header Image & Close Button */}
            <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0 overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-md cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#0A54B1] text-white shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Price & Delivery on Image Bottom */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
                    {product.title}
                  </h2>
                  <p className="text-xs text-slate-200 mt-1 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" /> Delivery: {product.deliveryTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    {product.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {/* Tagline / Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A54B1] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Service Overview
                </h4>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {product.tagline}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Deliverables List */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0A54B1]" /> What You Get (Deliverables)
                </h4>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {product.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Audience & Methodology */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A54B1]">
                    Ideal For
                  </span>
                  <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
                    {product.audience}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    Methodology
                  </span>
                  <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
                    {product.methodology}
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Modal Action Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-center sm:justify-start">
                <span className="font-bold text-slate-900">{product.price}</span>
                <span>• 100% Satisfaction Guarantee</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => onBookConsultation(product)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" /> Consult First
                </button>
                <button
                  onClick={() => onOrderNow(product)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Order Package <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
