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
      className={`hover:bg-slate-50/80 transition-colors ${
        u.isDeleted ? "opacity-60 bg-rose-50/40" : ""
      }`}
    >
      {/* User Info */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
            {isCand ? <User className="w-4 h-4" /> : isEmp ? <Building2 className="w-4 h-4" /> : "A"}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
            <p className="text-slate-500 text-xs">{u.email}</p>
            {u.companyName && (
              <p className="text-xs text-sky-600 font-medium mt-0.5">{u.companyName}</p>
            )}
          </div>
        </div>
      </td>

      {/* Role Pill */}
      <td className="p-4">
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
            isCand
              ? "bg-sky-50 text-sky-700 border border-sky-200/60"
              : isEmp
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
              : "bg-amber-50 text-amber-700 border border-amber-200/60"
          }`}
        >
          {u.role?.toLowerCase()}
        </span>
      </td>

      {/* Membership Plan */}
      <td className="p-4">
        {u.subscription?.plan ? (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {u.subscription.plan.name}
          </span>
        ) : (
          <span className="text-slate-500 text-xs font-medium">Free Tier</span>
        )}
      </td>

      {/* Status Badges */}
      <td className="p-4 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {u.isDeleted ? (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
              Soft Deleted
            </span>
          ) : u.isBanned ? (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
              Suspended
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          )}

          {u.emailVerified ? (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              Email Verified
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Unverified
            </span>
          )}
        </div>
      </td>

      {/* Activity Counts */}
      <td className="p-4 text-xs text-slate-500">
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
              className="h-8 px-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
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
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-amber-600 hover:bg-amber-50"
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
                className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                onClick={() => onSoftDelete(u)}
                variant="ghost"
                size="sm"
                title="Soft Delete"
                className="h-8 px-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            ))}
        </div>
      </td>
    </tr>
  );
}
