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
import { DeleteUserModal } from "@/features/admin/components/users/delete-user-modal";
import { Pagination } from "@/components/ui/table";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Ban modal state
  const [banModalUser, setBanModalUser] = useState<AdminUserItemDTO | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirmation modal state
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserItemDTO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        includeDeleted,
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;

      const res = await adminService.listUsers(params);
      if (res) {
        const rawList = Array.isArray(res) ? res : res.users || [];
        const userList = rawList.filter(
          (u: any) => u.email?.toLowerCase() !== "devamin.bd@gmail.com"
        );
        setUsers(userList);
        const resolvedTotal =
          res.meta?.total !== undefined ? res.meta.total : userList.length;
        setTotalCount(resolvedTotal);
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not load user list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, roleFilter, includeDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
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

  const handleSoftDelete = (user: AdminUserItemDTO) => {
    setDeleteModalUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;
    try {
      setDeleteLoading(true);
      await adminService.softDeleteUser(deleteModalUser.id);
      toast.success(`User ${deleteModalUser.email} has been moved to Trash.`);
      setDeleteModalUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to soft delete user");
    } finally {
      setDeleteLoading(false);
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

  return (
    <div className="space-y-6">

      <AdminPageHeader
        title="User Directory"
        description="Manage candidates, employers, email verification status, and account suspensions."
      >
        <Button
          onClick={() => setIncludeDeleted(!includeDeleted)}
          variant="outline"
          className={`rounded-xl text-xs font-semibold h-10 px-4 transition-all shadow-xs ${
            includeDeleted
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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
        onOpenBanModal={(u) => setBanModalUser(u)}
        onSoftDelete={handleSoftDelete}
        onRestore={handleRestore}
      />

      <Pagination
        card
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />

      <BanUserModal
        user={banModalUser}
        onClose={() => setBanModalUser(null)}
        banReason={banReason}
        setBanReason={setBanReason}
        onConfirm={handleToggleBan}
        loading={actionLoading}
      />

      <DeleteUserModal
        isOpen={Boolean(deleteModalUser)}
        user={deleteModalUser}
        onClose={() => setDeleteModalUser(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
