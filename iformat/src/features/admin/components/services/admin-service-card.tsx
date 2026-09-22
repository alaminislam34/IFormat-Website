"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Edit2, Trash2, Eye, EyeOff, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { ServiceProductWithStatus } from "@/stores/use-services-store";

interface AdminServiceCardProps {
  service: ServiceProductWithStatus;
  onEdit: (service: ServiceProductWithStatus) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function AdminServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
}: AdminServiceCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isActive = service.isActive !== false;

  return (
    <div
      className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col relative group ${
        isActive
          ? "border-slate-200 hover:shadow-xl hover:border-blue-300"
          : "border-slate-200/60 opacity-75 bg-slate-50/50"
      }`}
    >
      {/* Top Image Preview & Badges */}
      <div className="h-44 relative bg-slate-900 overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm">
            {service.category}
          </span>
          {service.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-linear-to-r from-[#5DE0E6] to-[#004AAD] text-white shadow-sm">
              {service.badge}
            </span>
          )}
        </div>

        {/* Visibility Pill */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={() => onToggleStatus(service.id)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer ${
              isActive
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
            title={isActive ? "Click to deactivate" : "Click to activate"}
          >
            {isActive ? (
              <>
                <Eye className="w-3 h-3" /> Published
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" /> Draft
              </>
            )}
          </button>
        </div>

        {/* Bottom Price & Delivery info overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs z-10">
          <span className="flex items-center gap-1 text-slate-200 font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-cyan-300" /> {service.deliveryTime}
          </span>
          <span className="text-lg font-black text-white">{service.price}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <h4 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1 group-hover:text-[#004AAD] transition-colors">
          {service.title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {service.tagline || service.description}
        </p>

        {/* Deliverables snippet */}
        <div className="space-y-1.5 mb-5 flex-1">
          {service.deliverables?.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
          {service.deliverables && service.deliverables.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400 pl-5.5">
              +{service.deliverables.length - 3} more deliverables
            </span>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          {showConfirmDelete ? (
            <div className="flex items-center justify-between w-full p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs">
              <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Delete service?
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(service.id)}
                  className="px-2 py-1 rounded text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onToggleStatus(service.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isActive ? "Deactivate" : "Activate"}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(service)}
                  className="text-xs font-bold text-slate-700 hover:text-[#004AAD] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
