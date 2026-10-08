"use client";

import React from "react";
import Image from "next/image";
import {
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Star,
  Edit2,
} from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ServiceProductWithStatus } from "@/stores/use-services-store";
import { AdminServiceStatusDropdown } from "./admin-service-status-dropdown";
import { AdminServiceActionDropdown } from "./admin-service-action-dropdown";

interface AdminServiceTableRowProps {
  service: ServiceProductWithStatus;
  top3Slot: number;
  onEdit: (service: ServiceProductWithStatus) => void;
  onPreview: (service: ServiceProductWithStatus) => void;
  onDeleteConfirm: (service: ServiceProductWithStatus) => void;
  onToggleStatus: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onPinToTop?: (id: string) => void;
  onSetHomepageSlot?: (id: string, slot: 1 | 2 | 3 | null) => void;
  onToggleHomepageFeature?: (id: string) => void;
}

export function AdminServiceTableRow({
  service,
  top3Slot,
  onEdit,
  onPreview,
  onDeleteConfirm,
  onToggleStatus,
  onMove,
  onPinToTop,
  onSetHomepageSlot,
  onToggleHomepageFeature,
}: AdminServiceTableRowProps) {
  const isActive = service.isActive !== false;
  const isCurrentlyOnHome = isActive && top3Slot >= 0 && top3Slot < 3;

  return (
    <TableRow
      className={`group hover:bg-slate-50/80 transition-colors ${
        !isActive ? "bg-slate-50/30 opacity-85" : ""
      }`}
    >
      {/* Service Info */}
      <TableCell className="min-w-64">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/70 overflow-hidden relative shrink-0 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
            title="Click to edit service"
          >
            {service.image ? (
              <Image
                src={service.image}
                alt={service.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sky-600 bg-sky-50">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onEdit(service)}
                className="font-bold text-slate-900 text-xs sm:text-sm truncate hover:text-[#0A54B1] transition-colors text-left cursor-pointer"
                title="Click to edit service"
              >
                {service.title}
              </button>
              {isActive && isCurrentlyOnHome && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-[#0A54B1] border border-sky-200 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-[#0A54B1]" /> Slot #{top3Slot + 1}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-60 mt-0.5">
              {service.tagline || service.description}
            </p>
            {service.deliverables && service.deliverables.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                {service.deliverables.length} deliverables
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell className="whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 inline-block">
          {service.category}
        </span>
      </TableCell>

      {/* Price */}
      <TableCell className="whitespace-nowrap">
        <span className="text-xs font-extrabold text-slate-900 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl">
          {service.price}
        </span>
      </TableCell>

      {/* Turnaround */}
      <TableCell className="whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          {service.deliveryTime}
        </span>
      </TableCell>

      {/* Badge */}
      <TableCell className="whitespace-nowrap">
        {service.badge ? (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {service.badge}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </TableCell>

      {/* Show on Home */}
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleHomepageFeature?.(service.id)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isCurrentlyOnHome
                ? "bg-amber-50 border-amber-300 text-amber-500 shadow-2xs hover:bg-amber-100"
                : "bg-white border-slate-200 text-slate-300 hover:text-amber-400 hover:border-amber-200"
            }`}
            title={isCurrentlyOnHome ? "Remove from Homepage" : "Show on Homepage"}
          >
            <Star className={`w-3.5 h-3.5 ${isCurrentlyOnHome ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>

          <select
            value={isCurrentlyOnHome ? String(top3Slot + 1) : "none"}
            onChange={(e) => {
              const val = e.target.value;
              onSetHomepageSlot?.(service.id, val === "none" ? null : (Number(val) as 1 | 2 | 3));
            }}
            className={`text-xs font-bold px-2 py-1 rounded-xl border cursor-pointer shadow-2xs ${
              isCurrentlyOnHome
                ? "bg-sky-50 text-[#0A54B1] border-sky-300 font-extrabold"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            <option value="none">Off Home</option>
            <option value="1">⭐ Slot #1</option>
            <option value="2">⭐ Slot #2</option>
            <option value="3">⭐ Slot #3</option>
          </select>
        </div>
      </TableCell>

      {/* Status Dropdown (Portal-based, zero clipping) */}
      <TableCell className="whitespace-nowrap">
        <AdminServiceStatusDropdown
          serviceId={service.id}
          isActive={isActive}
          onToggleStatus={onToggleStatus}
        />
      </TableCell>

      {/* Prominent Edit Button + Actions Menu */}
      <TableCell className="text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/90 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={() => onEdit(service)}
            className="h-8 px-2.5 rounded-xl bg-sky-50 hover:bg-[#0A54B1] text-[#0A54B1] hover:text-white border border-sky-200 hover:border-[#0A54B1] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            title="Edit service details, price, and deliverables"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>

          <AdminServiceActionDropdown
            service={service}
            top3Slot={top3Slot}
            onEdit={onEdit}
            onPreview={onPreview}
            onDeleteConfirm={onDeleteConfirm}
            onMove={onMove}
            onPinToTop={onPinToTop}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
