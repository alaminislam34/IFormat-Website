import React from "react";
import { TableFilterBar } from "@/components/ui/table";

interface UserFilterBarProps {
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  search: string;
  setSearch: (search: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function UserFilterBar({
  roleFilter,
  setRoleFilter,
  search,
  setSearch,
  onSearchSubmit,
}: UserFilterBarProps) {
  const roles = [
    { key: "ALL", label: "All Users" },
    { key: "CANDIDATE", label: "Candidates" },
    { key: "EMPLOYER", label: "Employers" },
    { key: "ADMIN", label: "Admins" },
  ];

  return (
    <TableFilterBar
      tabs={roles}
      activeTab={roleFilter}
      onTabChange={setRoleFilter}
      search={search}
      onSearchChange={setSearch}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder="Search by name, email, company..."
    />
  );
}
