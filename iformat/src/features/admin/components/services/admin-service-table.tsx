"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[340px]">Service / Product</TableHead>
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
            services.map((service) => {
              const isActive = service.isActive !== false;
              const isDeleting = deleteConfirmId === service.id;

              return (
                <TableRow
                  key={service.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    !isActive ? "bg-slate-50/40 opacity-80" : ""
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
                        <p className="text-[11px] text-slate-500 truncate max-w-[260px] mt-0.5">
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

                  {/* Status Toggle */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(service.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={isActive ? "Click to set as Draft" : "Click to Publish"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <span>{isActive ? "Published" : "Draft / Hidden"}</span>
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {isDeleting ? (
                      <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-150">
                        <span className="text-[11px] font-semibold text-rose-600 mr-1">
                          Confirm?
                        </span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            onDelete(service.id);
                            setDeleteConfirmId(null);
                          }}
                          className="h-7 px-2 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Yes, Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirmId(null)}
                          className="h-7 px-2 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleStatus(service.id)}
                          className={`h-8 w-8 p-0 rounded-xl cursor-pointer ${
                            isActive
                              ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                              : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={isActive ? "Hide / Unpublish" : "Publish"}
                        >
                          {isActive ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(service)}
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(service.id)}
                          className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
