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
} from "lucide-react";
import { toast } from "sonner";
import {
  useServicesStore,
  ServiceProductWithStatus,
} from "@/stores/use-services-store";
import { AdminServiceCard } from "@/features/admin/components/services/admin-service-card";
import { AdminServiceEditorModal } from "@/features/admin/components/services/admin-service-editor-modal";

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
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());

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
    const newStatus = target?.isActive !== false ? "deactivated" : "activated";
    toggleServiceStatus(id);
    toast.info(`Service "${target?.title || "Product"}" is now ${newStatus}.`);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all services to default presets? Any custom additions will be lost.")) {
      resetToDefaults();
      toast.success("Services catalog reset to defaults.");
    }
  };

  return (
    <div className=" mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-sky-50 text-[#004AAD] border border-sky-100">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Service Products Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, update, and manage the career branding products available on the website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset catalog to standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-[#5DE0E6] to-[#004AAD] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Service
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Services
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3 h-3" /> Published
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.active}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> Drafts / Hidden
          </span>
          <p className="text-2xl font-black text-slate-600 mt-1">{metrics.inactive}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3" /> Categories
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">{metrics.categoriesCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services by title, category, or keyword..."
            className="w-full text-xs font-semibold pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "ACTIVE" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-600"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "INACTIVE" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600"
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
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
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#004AAD] text-white text-xs font-bold hover:bg-[#004AAD]/90 cursor-pointer shadow-sm"
            >
              + Add New Service
            </button>
          </div>
        </div>
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
