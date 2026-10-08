"use client";

import React, { useState } from "react";
import { ShoppingBag, Star } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ServiceProductWithStatus } from "@/stores/use-services-store";
import { AdminServiceTableRow } from "./admin-service-table-row";
import { AdminServicePreviewModal } from "./admin-service-preview-modal";
import { AdminServiceDeleteModal } from "./admin-service-delete-modal";

interface AdminServiceTableProps {
  services: ServiceProductWithStatus[];
  allActiveServices?: ServiceProductWithStatus[];
  onEdit: (service: ServiceProductWithStatus) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onPinToTop?: (id: string) => void;
  onSetHomepageSlot?: (id: string, slot: 1 | 2 | 3 | null) => void;
  onToggleHomepageFeature?: (id: string) => void;
}

export function AdminServiceTable({
  services,
  allActiveServices = [],
  onEdit,
  onDelete,
  onToggleStatus,
  onMove,
  onPinToTop,
  onSetHomepageSlot,
  onToggleHomepageFeature,
}: AdminServiceTableProps) {
  const [previewService, setPreviewService] = useState<ServiceProductWithStatus | null>(null);
  const [deleteConfirmService, setDeleteConfirmService] = useState<ServiceProductWithStatus | null>(null);

  return (
    <div className="relative">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-visible">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-64">Service / Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Turnaround</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="min-w-36 text-center">
                <span className="flex items-center justify-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Show on Home
                </span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right sticky right-0 bg-slate-50/90 z-20 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0 border-none">
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
                const top3Slot = allActiveServices.findIndex((s) => s.id === service.id);
                return (
                  <AdminServiceTableRow
                    key={service.id}
                    service={service}
                    top3Slot={top3Slot}
                    onEdit={onEdit}
                    onPreview={setPreviewService}
                    onDeleteConfirm={setDeleteConfirmService}
                    onToggleStatus={onToggleStatus}
                    onMove={onMove}
                    onPinToTop={onPinToTop}
                    onSetHomepageSlot={onSetHomepageSlot}
                    onToggleHomepageFeature={onToggleHomepageFeature}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details & Delete Modals */}
      <AdminServicePreviewModal
        service={previewService}
        onClose={() => setPreviewService(null)}
        onEdit={onEdit}
      />
      <AdminServiceDeleteModal
        service={deleteConfirmService}
        onClose={() => setDeleteConfirmService(null)}
        onConfirm={onDelete}
      />
    </div>
  );
}
