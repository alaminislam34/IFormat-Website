import React from "react";
import { Loader2 } from "lucide-react";
import { AdminUserItemDTO } from "@/services/admin.service";
import { UserRow } from "./user-row";

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
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          No users matched your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Membership Plan</th>
                <th className="p-4">Status & Flags</th>
                <th className="p-4">Activity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  onVerifyEmail={onVerifyEmail}
                  onOpenBanModal={onOpenBanModal}
                  onSoftDelete={onSoftDelete}
                  onRestore={onRestore}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
