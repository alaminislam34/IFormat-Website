"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { AdminUserItemDTO } from "@/services/admin.service";
import { CompanyRow } from "./company-row";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
} from "@/components/ui/table";

interface CompanyTableProps {
  companies: AdminUserItemDTO[];
  loading: boolean;
  uploadingLogoId: string | null;
  onLogoUpload: (companyId: string, file: File) => void;
  onToggleVerification: (company: AdminUserItemDTO) => void;
  onDeleteCompany: (company: AdminUserItemDTO) => void;
  onPreviewVideo: (url: string, companyName: string) => void;
}

export function CompanyTable({
  companies,
  loading,
  uploadingLogoId,
  onLogoUpload,
  onToggleVerification,
  onDeleteCompany,
  onPreviewVideo,
}: CompanyTableProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Profile</TableHead>
            <TableHead>Trust Badge</TableHead>
            <TableHead>Membership Tier</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead>Links & Media</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            /* Animated Table Skeleton Rows */
            Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={`company-table-skeleton-${idx}`} className="hover:bg-transparent">
                {/* Company profile column */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </TableCell>

                {/* Trust Badge */}
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-24 rounded-xl" />
                </TableCell>

                {/* Membership Tier */}
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-20 rounded-lg" />
                </TableCell>

                {/* Listings */}
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </TableCell>

                {/* Links & Media */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-6 w-16 rounded-lg" />
                    <Skeleton className="h-6 w-14 rounded-lg" />
                  </div>
                </TableCell>

                {/* Joined */}
                <TableCell className="py-4">
                  <Skeleton className="h-3.5 w-20" />
                </TableCell>

                {/* Actions */}
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-8 w-20 rounded-xl" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : companies.length === 0 ? (
            /* Empty State */
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="p-0 border-none">
                <div className="py-20 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200/60 shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      No employer organizations found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No company profiles match your current search query or filter criteria.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            companies.map((c) => (
              <CompanyRow
                key={c.id}
                company={c}
                uploadingLogoId={uploadingLogoId}
                onLogoUpload={onLogoUpload}
                onToggleVerification={onToggleVerification}
                onDeleteCompany={onDeleteCompany}
                onPreviewVideo={onPreviewVideo}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
