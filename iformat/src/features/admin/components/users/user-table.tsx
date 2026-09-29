import React from "react";
import { Users } from "lucide-react";
import { AdminUserItemDTO } from "@/services/admin.service";
import { UserRow } from "./user-row";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
} from "@/components/ui/table";

interface UserTableProps {
  users: AdminUserItemDTO[];
  loading: boolean;
  onVerifyEmail: (user: AdminUserItemDTO) => void;
  onOpenBanModal: (user: AdminUserItemDTO) => void;
  onSoftDelete: (user: AdminUserItemDTO) => void;
  onRestore: (user: AdminUserItemDTO) => void;
}

export function UserTable({
  users,
  loading,
  onVerifyEmail,
  onOpenBanModal,
  onSoftDelete,
  onRestore,
}: UserTableProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Membership Plan</TableHead>
            <TableHead>Status & Flags</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            /* UI-Preserving Skeleton Loading Rows */
            Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={`user-skeleton-${idx}`} className="hover:bg-transparent">
                {/* User column */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>

                {/* Membership Plan */}
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </TableCell>

                {/* Status & Flags */}
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>

                {/* Activity */}
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            /* Empty State */
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="p-0 border-none">
                <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200/60 shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">No Users Found</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      No users matched your search criteria or role filters.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            /* Real Data Rows */
            users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                onVerifyEmail={onVerifyEmail}
                onOpenBanModal={onOpenBanModal}
                onSoftDelete={onSoftDelete}
                onRestore={onRestore}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
