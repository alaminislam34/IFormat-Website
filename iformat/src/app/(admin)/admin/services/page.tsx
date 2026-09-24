"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ShoppingBag,
  Eye,
  EyeOff,
  RotateCcw,
  Layers,
  Table2,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useServicesStore,
  ServiceProductWithStatus,
} from "@/stores/use-services-store";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { AdminServiceCard } from "@/features/admin/components/services/admin-service-card";
import { AdminServiceTable } from "@/features/admin/components/services/admin-service-table";
import { AdminServiceEditorModal } from "@/features/admin/components/services/admin-service-editor-modal";
import { Pagination } from "@/components/ui/table";

export default function AdminServicesPage() {
  const {
    services,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    resetToDefaults,
  } = useServicesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceProductWithStatus | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Metrics
  const metrics = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive, categoriesCount: categories.length };
  }, [services, categories]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        searchQuery === "" ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.price.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || service.category === selectedCategory;

      const isActive = service.isActive !== false;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INACTIVE" && !isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchQuery, selectedCategory, statusFilter]);

  // Paginated Slice
  const paginatedServices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, page, pageSize]);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceProductWithStatus) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = (
    data: Omit<ServiceProductWithStatus, "id"> & { id?: string }
  ) => {
    if (editingService) {
      updateService(editingService.id, data);
      toast.success(`Service "${data.title}" updated successfully.`);
    } else {
      addService(data);
      toast.success(`New service "${data.title}" added to the catalog.`);
    }
  };

  const handleDeleteService = (id: string) => {
    const target = services.find((s) => s.id === id);
    deleteService(id);
    toast.success(`Service "${target?.title || "Product"}" has been deleted.`);
  };

  const handleToggleStatus = (id: string) => {
    const target = services.find((s) => s.id === id);
    const newStatus = target?.isActive !== false ? "drafted" : "published";
    toggleServiceStatus(id);
    toast.info(`Service "${target?.title || "Product"}" is now ${newStatus}.`);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all services to default presets? Any custom additions will be lost."
      )
    ) {
      resetToDefaults();
      toast.success("Services catalog reset to defaults.");
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <AdminPageHeader
        title="Service Products Management"
        description="Configure career branding services, adjust pricing, manage deliverables, and update visibility."
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
            title="Reset catalog to standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenCreateModal}
            className="rounded-xl text-xs font-semibold bg-[#0A54B1] hover:bg-[#08428C] text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add New Service</span>
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Services
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.total}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              Published
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
              {metrics.active}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Drafts / Hidden
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-700 mt-1">
              {metrics.inactive}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-1">
              Categories
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-sky-700 mt-1">
              {metrics.categoriesCount}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, price, category, or keyword..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-[#0A54B1] transition-all"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#0A54B1] cursor-pointer"
          >
            <option value="ALL">All Categories ({services.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              onClick={() => {
                setStatusFilter("ACTIVE");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Published ({metrics.active})
            </button>
            <button
              onClick={() => {
                setStatusFilter("INACTIVE");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "INACTIVE"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Drafts ({metrics.inactive})
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#0A54B1] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#0A54B1] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <AdminServiceTable
          services={paginatedServices}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteService}
          onToggleStatus={handleToggleStatus}
        />
      ) : filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedServices.map((service) => (
            <AdminServiceCard
              key={service.id}
              service={service}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteService}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Services Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || selectedCategory !== "ALL" || statusFilter !== "ALL"
                ? "No service products match your search or filter criteria. Try resetting filters."
                : "No services have been added yet. Click 'Add New Service' to create your first product."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(searchQuery || selectedCategory !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setStatusFilter("ALL");
                  setPage(1);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#0A54B1] text-white text-xs font-bold hover:bg-[#08428C] cursor-pointer shadow-sm"
            >
              + Add New Service
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredServices.length > 0 && (
        <Pagination
          card
          currentPage={page}
          pageSize={pageSize}
          totalCount={filteredServices.length}
          loading={false}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      )}

      {/* Editor Modal */}
      <AdminServiceEditorModal
        isOpen={isModalOpen}
        editingService={editingService}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
      />
    </div>
  );
}
