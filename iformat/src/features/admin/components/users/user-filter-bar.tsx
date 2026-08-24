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
  const roles = ["ALL", "CANDIDATE", "EMPLOYER", "ADMIN"];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full md:w-auto">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === r
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-slate-950 border-slate-800 text-white text-xs rounded-xl focus-visible:ring-sky-500"
        />
      </form>
    </div>
  );
}
