"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  Eye,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  Globe,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ServiceProductWithStatus } from "@/stores/use-services-store";

interface AdminServiceTableProps {
  services: ServiceProductWithStatus[];
  onEdit: (service: ServiceProductWithStatus) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function AdminServiceTable({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
}: AdminServiceTableProps) {
  // Dropdown states
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<{
    id: string;
    openUpwards: boolean;
  } | null>(null);

  const [activeActionDropdown, setActiveActionDropdown] = useState<{
    id: string;
    openUpwards: boolean;
  } | null>(null);

  // Modals state
  const [previewService, setPreviewService] = useState<ServiceProductWithStatus | null>(null);
  const [deleteConfirmService, setDeleteConfirmService] = useState<ServiceProductWithStatus | null>(null);

  // References for outside click detection
  const tableRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(e.target as Node)
      ) {
        setActiveStatusDropdown(null);
        setActiveActionDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveStatusDropdown(null);
        setActiveActionDropdown(null);
        setPreviewService(null);
        setDeleteConfirmService(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Determine if a dropdown should open upwards (near bottom row / screen edge)
  const calculateOpenUpwards = (element: HTMLElement, requiredHeight: number) => {
    const rect = element.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    return spaceBelow < requiredHeight;
  };

  const handleToggleStatusDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveActionDropdown(null); // Close other dropdown
    if (activeStatusDropdown?.id === id) {
      setActiveStatusDropdown(null);
    } else {
      const openUpwards = calculateOpenUpwards(e.currentTarget, 190);
      setActiveStatusDropdown({ id, openUpwards });
    }
  };

  const handleToggleActionDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveStatusDropdown(null); // Close other dropdown
    if (activeActionDropdown?.id === id) {
      setActiveActionDropdown(null);
    } else {
      const openUpwards = calculateOpenUpwards(e.currentTarget, 230);
      setActiveActionDropdown({ id, openUpwards });
    }
  };

  return (
    <div ref={tableRef} className="relative">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-visible">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-85">Service / Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Turnaround</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="p-0 border-none">
                  <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-400 flex items-center justify-center shadow-xs">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                        No Services Found
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No services match your active filter criteria. Try adjusting your query.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service, index) => {
                const isActive = service.isActive !== false;
                const isStatusOpen = activeStatusDropdown?.id === service.id;
                const isStatusUpwards =
                  activeStatusDropdown?.id === service.id && activeStatusDropdown.openUpwards;

                const isActionOpen = activeActionDropdown?.id === service.id;
                const isActionUpwards =
                  activeActionDropdown?.id === service.id && activeActionDropdown.openUpwards;

                return (
                  <TableRow
                    key={service.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !isActive ? "bg-slate-50/30 opacity-85" : ""
                    }`}
                  >
                    {/* Service Info (Thumbnail + Title + Deliverables) */}
                    <TableCell>
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/70 overflow-hidden relative shrink-0 shadow-2xs">
                          {service.image ? (
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sky-600 bg-sky-50">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {service.title}
                            </p>
                            {service.badge && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-linear-to-r from-sky-500 to-[#0A54B1] text-white shrink-0">
                                {service.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-65 mt-0.5">
                            {service.tagline || service.description}
                          </p>
                          {service.deliverables && service.deliverables.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              {service.deliverables.length} deliverables included
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 inline-block whitespace-nowrap">
                        {service.category}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="text-xs font-extrabold text-slate-900 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl whitespace-nowrap">
                        {service.price}
                      </span>
                    </TableCell>

                    {/* Turnaround */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        {service.deliveryTime}
                      </span>
                    </TableCell>

                    {/* Badge */}
                    <TableCell>
                      {service.badge ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit whitespace-nowrap">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {service.badge}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Status Dropdown */}
                    <TableCell>
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatusDropdown(service.id, e)}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80"
                          }`}
                          title="Click to change status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          <span>{isActive ? "Published" : "Draft / Hidden"}</span>
                          <ChevronDown
                            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                              isStatusOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Status Dropdown Menu with Smart Top/Bottom Positioning */}
                        {isStatusOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute left-0 z-50 w-52 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                              isStatusUpwards
                                ? "bottom-full mb-1.5 origin-bottom-left"
                                : "top-full mt-1.5 origin-top-left"
                            }`}
                          >
                            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Change Visibility
                            </div>

                            {/* Option: Published */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!isActive) onToggleStatus(service.id);
                                setActiveStatusDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-800 font-bold"
                                  : "hover:bg-slate-100 text-slate-700 font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <div>
                                  <div className="leading-tight">Published</div>
                                  <div className="text-[10px] text-slate-400 font-normal">
                                    Visible on storefront
                                  </div>
                                </div>
                              </div>
                              {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </button>

                            {/* Option: Draft / Hidden */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isActive) onToggleStatus(service.id);
                                setActiveStatusDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                !isActive
                                  ? "bg-slate-100 text-slate-800 font-bold"
                                  : "hover:bg-slate-100 text-slate-700 font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                <div>
                                  <div className="leading-tight">Draft / Hidden</div>
                                  <div className="text-[10px] text-slate-400 font-normal">
                                    Hidden from storefront
                                  </div>
                                </div>
                              </div>
                              {!isActive && <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => handleToggleActionDropdown(service.id, e)}
                          className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                            isActionOpen
                              ? "bg-slate-100 border-slate-300 text-slate-900"
                              : "bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                          title="Service Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu with Smart Top/Bottom Positioning */}
                        {isActionOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-0 z-50 w-44 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 ${
                              isActionUpwards
                                ? "bottom-full mb-1.5 origin-bottom-right"
                                : "top-full mt-1.5 origin-top-right"
                            }`}
                          >
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewService(service);
                                setActiveActionDropdown(null);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                              <span>View Details</span>
                            </button>

                            {/* Edit Service */}
                            <button
                              type="button"
                              onClick={() => {
                                onEdit(service);
                                setActiveActionDropdown(null);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Service</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            {/* Delete Service */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmService(service);
                                setActiveActionDropdown(null);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Service</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details / Preview Modal */}
      {previewService && (
        <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setPreviewService(null)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Image or Banner */}
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              {previewService.image ? (
                <Image
                  src={previewService.image}
                  alt={previewService.title}
                  fill
                  className="object-cover opacity-85"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-sky-600 to-[#0A54B1] text-white">
                  <ShoppingBag className="w-12 h-12 opacity-40" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30" />

              {/* Close Button */}
              <button
                onClick={() => setPreviewService(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badges on Banner */}
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
                  {previewService.category}
                </span>

                {previewService.badge && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {previewService.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {previewService.title}
                  </h3>
                  <span className="text-base font-extrabold text-[#0A54B1] bg-sky-50 border border-sky-100 px-3 py-1 rounded-xl">
                    {previewService.price}
                  </span>
                </div>
                {previewService.tagline && (
                  <p className="text-xs font-semibold text-sky-700 mt-1">
                    {previewService.tagline}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {previewService.deliveryTime}
                  </span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      previewService.isActive !== false ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        previewService.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {previewService.isActive !== false ? "Published / Active" : "Draft / Hidden"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Overview & Description
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {previewService.description || "No full description provided."}
                </p>
              </div>

              {/* Deliverables */}
              {previewService.deliverables && previewService.deliverables.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Deliverables ({previewService.deliverables.length})
                  </h4>
                  <div className="space-y-1.5">
                    {previewService.deliverables.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/60 border border-slate-100 px-3 py-2 rounded-xl"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewService(null)}
                className="rounded-xl cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onEdit(previewService);
                  setPreviewService(null);
                }}
                className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Service</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmService && (
        <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setDeleteConfirmService(null)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Delete Service?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteConfirmService.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmService(null)}
                className="flex-1 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(deleteConfirmService.id);
                  setDeleteConfirmService(null);
                }}
                className="flex-1 rounded-xl cursor-pointer"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
