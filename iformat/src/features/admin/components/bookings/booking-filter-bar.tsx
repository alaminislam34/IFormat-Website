import React from "react";
import { TableFilterBar } from "@/components/ui/table";

interface BookingFilterBarProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export function BookingFilterBar({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  onSearchSubmit,
}: BookingFilterBarProps) {
  const statuses = [
    { key: "ALL", label: "All Orders" },
    { key: "PENDING", label: "Cancellation Requests" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <TableFilterBar
      tabs={statuses}
      activeTab={statusFilter}
      onTabChange={setStatusFilter}
      search={search}
      onSearchChange={setSearch}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder="Search by package, name, phone, email..."
    />
  );
}
