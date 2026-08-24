import React from "react";
import { User, Building2, MailCheck, ShieldAlert, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUserItemDTO } from "@/services/admin.service";

interface UserRowProps {
  user: AdminUserItemDTO;
  onVerifyEmail: (user: AdminUserItemDTO) => void;
  onOpenBanModal: (user: AdminUserItemDTO) => void;
  onSoftDelete: (user: AdminUserItemDTO) => void;
  onRestore: (user: AdminUserItemDTO) => void;
}

export function UserRow({
  user: u,
  onVerifyEmail,
  onOpenBanModal,
  onSoftDelete,
  onRestore,
}: UserRowProps) {
  const roleStr = u.role?.toUpperCase();
  const isCand = roleStr === "CANDIDATE";
  const isEmp = roleStr === "EMPLOYER";

  return (
    <tr
      className={`hover:bg-slate-800/30 transition-colors ${
        u.isDeleted ? "opacity-60 bg-rose-950/10" : ""
      }`}
    >
      {/* User Info */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
            {isCand ? <User className="w-4 h-4" /> : isEmp ? <Building2 className="w-4 h-4" /> : "A"}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{u.name}</p>
            <p className="text-slate-400 text-xs">{u.email}</p>
            {u.companyName && (
              <p className="text-[11px] text-sky-400 font-semibold mt-0.5">{u.companyName}</p>
            )}
          </div>
        </div>
      </td>

      {/* Role Pill */}
      <td className="p-4">
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            isCand
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              : isEmp
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          {u.role}
        </span>
      </td>

      {/* Membership Plan */}
      <td className="p-4">
        {u.subscription?.plan ? (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {u.subscription.plan.name}
          </span>
        ) : (
          <span className="text-slate-500 text-[11px] font-medium">Free Tier</span>
        )}
      </td>

      {/* Status Badges */}
      <td className="p-4 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {u.isDeleted ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
              Soft Deleted
            </span>
          ) : u.isBanned ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Suspended / Banned
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          )}

          {u.emailVerified ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
              Email Verified
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
              Unverified
            </span>
          )}
        </div>
      </td>

      {/* Activity Counts */}
      <td className="p-4 text-[11px] text-slate-400">
        {isCand && <span>{u._count.applications} apps • {u._count.cvs} CVs</span>}
        {isEmp && <span>{u._count.jobPostings} jobs posted</span>}
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {!u.emailVerified && !u.isDeleted && (
            <Button
              onClick={() => onVerifyEmail(u)}
              variant="ghost"
              size="sm"
              title="Force Verify Email"
              className="h-8 px-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg text-xs"
            >
              <MailCheck className="w-3.5 h-3.5" />
            </Button>
          )}

          {u.role !== "ADMIN" && !u.isDeleted && (
            <Button
              onClick={() => onOpenBanModal(u)}
              variant="ghost"
              size="sm"
              title={u.isBanned ? "Unban Account" : "Suspend Account"}
              className={`h-8 px-2 rounded-lg text-xs ${
                u.isBanned
                  ? "text-emerald-400 hover:bg-emerald-950/40"
                  : "text-amber-400 hover:bg-amber-950/40"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </Button>
          )}

          {u.role !== "ADMIN" &&
            (u.isDeleted ? (
              <Button
                onClick={() => onRestore(u)}
                variant="ghost"
                size="sm"
                title="Restore User"
                className="h-8 px-2 text-emerald-400 hover:bg-emerald-950/40 rounded-lg text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                onClick={() => onSoftDelete(u)}
                variant="ghost"
                size="sm"
                title="Soft Delete"
                className="h-8 px-2 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            ))}
        </div>
      </td>
    </tr>
  );
}
