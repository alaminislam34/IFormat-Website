"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Send,
  X,
  Loader2,
  Calendar,
  User,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFilterBar,
  Pagination,
  Skeleton,
} from "@/components/ui/table";
import { adminService, ContactInquiryItem } from "@/services/admin.service";
import { toast } from "sonner";

export default function AdminContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  // Active / Selected Inquiry for View Modal
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await adminService.listInquiries({
        page,
        limit: pageSize,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });

      if (res) {
        setInquiries(res.inquiries || []);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load contact inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadInquiries();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await adminService.updateInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`Inquiry marked as ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update inquiry status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (inq: ContactInquiryItem) => {
    if (!confirm(`Are you sure you want to delete inquiry from ${inq.fullName}?`)) return;
    try {
      setDeletingId(inq.id);
      await adminService.deleteInquiry(inq.id);
      toast.success("Inquiry deleted successfully");
      if (selectedInquiry?.id === inq.id) {
        setSelectedInquiry(null);
      }
      loadInquiries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete inquiry");
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const unread = inquiries.filter((i) => i.status === "UNREAD").length;
    const contacted = inquiries.filter((i) => i.status === "CONTACTED").length;
    const resolved = inquiries.filter((i) => i.status === "RESOLVED").length;
    return {
      total: totalCount || inquiries.length,
      unread,
      contacted,
      resolved,
    };
  }, [inquiries, totalCount]);

  const statusTabs = [
    { key: "ALL", label: `All Inquiries (${totalCount})` },
    { key: "UNREAD", label: "Unread" },
    { key: "CONTACTED", label: "Contacted" },
    { key: "RESOLVED", label: "Resolved" },
  ];

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <AdminPageHeader
        title="Contact Us Inquiries"
        description="Review, manage, and respond to incoming contact submissions from potential clients and partners."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadInquiries}
          disabled={loading}
          className="rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </AdminPageHeader>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Inquiries
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.total}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
              Unread
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-1">
              {metrics.unread}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">
              Contacted
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-sky-700 mt-1">
              {metrics.contacted}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Resolved
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
              {metrics.resolved}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <TableFilterBar
        tabs={statusTabs}
        activeTab={statusFilter}
        onTabChange={(tab) => {
          setStatusFilter(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Search by sender name, email, phone, or message content..."
      />

      {/* Inquiries Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`inq-skeleton-${idx}`} className="hover:bg-transparent">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-52" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Skeleton className="h-8 w-16 rounded-xl" />
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : inquiries.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0 border-none">
                  <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-400 flex items-center justify-center shadow-xs">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                        No Inquiries Found
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {search.trim()
                          ? `No inquiries match "${search}". Try searching another name, email, or keyword.`
                          : "No contact submissions have been received in this category."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => {
                const dateObj = new Date(inq.createdAt);
                const isUnread = inq.status === "UNREAD";

                return (
                  <TableRow
                    key={inq.id}
                    className={`transition-colors cursor-pointer ${
                      isUnread ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-slate-50/80"
                    }`}
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    {/* Sender Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isUnread
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {inq.fullName ? inq.fullName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {inq.fullName}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {dateObj.toLocaleDateString()} at{" "}
                            {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Number */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {inq.phone ? (
                        <a
                          href={`tel:${inq.phone.replace(/[^0-9+]/g, "")}`}
                          className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-700 hover:text-sky-600 transition-colors"
                          title="Click to call"
                        >
                          <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{inq.phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not provided</span>
                      )}
                    </TableCell>

                    {/* Email */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`mailto:${inq.email}?subject=${encodeURIComponent(
                          "Regarding your inquiry to iFormat"
                        )}`}
                        className="inline-flex items-center gap-1.5 font-medium text-xs text-sky-600 hover:underline"
                        title="Click to email"
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>{inq.email}</span>
                      </a>
                    </TableCell>

                    {/* Message Preview */}
                    <TableCell>
                      <p className="text-xs text-slate-600 line-clamp-1 max-w-xs font-normal">
                        {inq.message}
                      </p>
                    </TableCell>

                    {/* Status with Quick Select */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inq.status}
                        disabled={updatingId === inq.id}
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-hidden transition-colors ${
                          inq.status === "UNREAD"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : inq.status === "CONTACTED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <option value="UNREAD">Unread</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInquiry(inq)}
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                          title="View Full Message"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          View
                        </Button>

                        <a
                          href={`mailto:${inq.email}?subject=${encodeURIComponent(
                            "Regarding your inquiry to iFormat"
                          )}`}
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 shadow-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Reply via Email"
                        >
                          <Mail className="w-3.5 h-3.5 text-sky-600" />
                          Reply
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === inq.id}
                          onClick={() => handleDelete(inq)}
                          className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Inquiry"
                        >
                          {deletingId === inq.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

      {/* Full Message View Modal with Fixed Header & Footer */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Fixed Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Inquiry from {selectedInquiry.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedInquiry.status === "UNREAD"
                          ? "bg-amber-100 text-amber-800"
                          : selectedInquiry.status === "CONTACTED"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {selectedInquiry.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString()} at{" "}
                      {new Date(selectedInquiry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Contact Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-xs font-semibold text-sky-600 hover:underline block truncate"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    Contact Number
                  </span>
                  {selectedInquiry.phone ? (
                    <a
                      href={`tel:${selectedInquiry.phone.replace(/[^0-9+]/g, "")}`}
                      className="text-xs font-semibold text-slate-900 hover:text-sky-600 block truncate"
                    >
                      {selectedInquiry.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic block">Not provided</span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Client Message
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Selector in Modal */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Update Resolution Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["UNREAD", "CONTACTED", "RESOLVED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingId === selectedInquiry.id}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, st)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        selectedInquiry.status === st
                          ? st === "UNREAD"
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : st === "CONTACTED"
                            ? "bg-sky-600 text-white border-sky-700 shadow-xs"
                            : "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st === "UNREAD" ? "Unread" : st === "CONTACTED" ? "Contacted" : "Resolved"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(selectedInquiry)}
                className="text-xs text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>

              <div className="flex items-center gap-2">
                {selectedInquiry.phone && (
                  <a
                    href={`tel:${selectedInquiry.phone.replace(/[^0-9+]/g, "")}`}
                    className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    Call Client
                  </a>
                )}
                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    "Regarding your inquiry to iFormat"
                  )}`}
                  className="h-9 px-4 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply by Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
