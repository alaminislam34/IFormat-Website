import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 w-full md:w-auto overflow-x-auto">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => setRoleFilter(r.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              roleFilter === r.key
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus-visible:ring-sky-500"
        />
      </form>
    </div>
  );
}
