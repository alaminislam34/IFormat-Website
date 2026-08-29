"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService, AdminUserItemDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { UserFilterBar } from "@/features/admin/components/users/user-filter-bar";
import { UserTable } from "@/features/admin/components/users/user-table";
import { BanUserModal } from "@/features/admin/components/users/ban-user-modal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Ban modal state
  const [banModalUser, setBanModalUser] = useState<AdminUserItemDTO | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = { includeDeleted };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;

      const res = await adminService.listUsers(params);
      if (res?.users) setUsers(res.users);
    } catch (err: any) {
      toast.error(err?.message || "Could not load user list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, includeDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleBan = async () => {
    if (!banModalUser) return;
    try {
      setActionLoading(true);
      const newBannedState = !banModalUser.isBanned;
      await adminService.banUser(banModalUser.id, newBannedState, banReason);
      toast.success(
        newBannedState
          ? `User ${banModalUser.email} has been suspended.`
          : `User ${banModalUser.email} has been unbanned.`
      );
      setBanModalUser(null);
      setBanReason("");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update ban status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDelete = async (user: AdminUserItemDTO) => {
    if (!confirm(`Are you sure you want to soft-delete ${user.name} (${user.email})?`)) return;
    try {
      await adminService.softDeleteUser(user.id);
      toast.success(`User ${user.email} soft-deleted.`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to soft delete user");
    }
  };

  const handleRestore = async (user: AdminUserItemDTO) => {
    try {
      await adminService.restoreUser(user.id);
      toast.success(`User ${user.email} restored successfully.`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to restore user");
    }
  };

  const handleVerifyEmail = async (user: AdminUserItemDTO) => {
    try {
      await adminService.forceVerifyEmail(user.id);
      toast.success(`Email for ${user.email} force-verified.`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify email");
    }
  };

  return (
    <div className="space-y-6">

      <AdminPageHeader
        title="User Directory"
        description="Manage candidates, employers, email verification status, and account suspensions."
      >
        <Button
          onClick={() => setIncludeDeleted(!includeDeleted)}
          variant="outline"
          className={`rounded-xl text-xs font-bold h-10 px-4 transition-all ${
            includeDeleted
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          {includeDeleted ? "Showing Soft-Deleted" : "Show Soft-Deleted (Trash)"}
        </Button>
      </AdminPageHeader>

      <UserFilterBar
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        search={search}
        setSearch={setSearch}
        onSearchSubmit={handleSearchSubmit}
      />

      <UserTable
        users={users}
        loading={loading}
        onVerifyEmail={handleVerifyEmail}
        onOpenBanModal={(u) => setBanModalUser(u)}
        onSoftDelete={handleSoftDelete}
        onRestore={handleRestore}
      />

      <BanUserModal
        user={banModalUser}
        onClose={() => setBanModalUser(null)}
        banReason={banReason}
        setBanReason={setBanReason}
        onConfirm={handleToggleBan}
        loading={actionLoading}
      />
    </div>
  );
}
