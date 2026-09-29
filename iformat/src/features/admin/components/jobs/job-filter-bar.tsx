import React from "react";
import { TableFilterBar } from "@/components/ui/table";

interface JobFilterBarProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function JobFilterBar({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  onSearchSubmit,
}: JobFilterBarProps) {
  const statuses = [
    { key: "ALL", label: "All Jobs" },
    { key: "PUBLISHED", label: "Published" },
    { key: "DRAFT", label: "Draft" },
    { key: "CLOSED", label: "Closed" },
    { key: "ARCHIVED", label: "Archived" },
  ];

  return (
    <TableFilterBar
      tabs={statuses}
      activeTab={statusFilter}
      onTabChange={setStatusFilter}
      search={search}
      onSearchChange={setSearch}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder="Search by title, company, category..."
    />
  );
}
