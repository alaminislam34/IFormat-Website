"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, UploadCloud, Camera } from "lucide-react";
import { toast } from "sonner";
import { ServiceProductWithStatus } from "@/stores/use-services-store";

interface AdminServiceEditorModalProps {
  isOpen: boolean;
  editingService: ServiceProductWithStatus | null;
  onClose: () => void;
  onSave: (serviceData: Omit<ServiceProductWithStatus, "id"> & { id?: string }) => void;
}

const CATEGORY_PRESETS = [
  "Executive Suite",
  "Founders & C-Suite",
  "Career Transition",
  "Digital Assets",
  "Strategy & Advisory",
  "Leadership Coaching",
];

const BADGE_PRESETS = ["", "Most Popular", "Premium", "Best Value", "Trending", "New"];

export function AdminServiceEditorModal({
  isOpen,
  editingService,
  onClose,
  onSave,
}: AdminServiceEditorModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Executive Suite");
  const [customCategory, setCustomCategory] = useState("");
  const [priceNum, setPriceNum] = useState<number>(199);
  const [price, setPrice] = useState("$199");
  const [deliveryTime, setDeliveryTime] = useState("3-5 Business Days");
  const [badge, setBadge] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [methodology, setMethodology] = useState("");
  const [image, setImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        toast.success(`Image "${file.name}" uploaded successfully.`);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (editingService) {
      setTitle(editingService.title || "");
      if (CATEGORY_PRESETS.includes(editingService.category)) {
        setCategory(editingService.category);
        setCustomCategory("");
      } else {
        setCategory("Other");
        setCustomCategory(editingService.category || "");
      }
      setPriceNum(editingService.priceNum ?? 199);
      setPrice(editingService.price || `$${editingService.priceNum ?? 199}`);
      setDeliveryTime(editingService.deliveryTime || "3-5 Business Days");
      setBadge(editingService.badge || "");
      setTagline(editingService.tagline || "");
      setDescription(editingService.description || "");
      setAudience(editingService.audience || "");
      setMethodology(editingService.methodology || "");
      setImage(editingService.image || "");
      setDeliverables(
        editingService.deliverables && editingService.deliverables.length > 0
          ? [...editingService.deliverables]
          : [""]
      );
      setIsActive(editingService.isActive !== undefined ? editingService.isActive : true);
    } else {
      // Reset defaults for new service
      setTitle("");
      setCategory("Executive Suite");
      setCustomCategory("");
      setPriceNum(199);
      setPrice("$199");
      setDeliveryTime("3-5 Business Days");
      setBadge("");
      setTagline("");
      setDescription("");
      setAudience("");
      setMethodology("");
      setImage("");
      setDeliverables(["1-on-1 Strategy Session", "ATS-Optimized Formatting", "Full Re-write & Delivery"]);
      setIsActive(true);
    }
  }, [editingService, isOpen]);

  const handlePriceNumChange = (val: number) => {
    setPriceNum(val);
    setPrice(`$${val}`);
  };

  const handleAddDeliverable = () => {
    setDeliverables(["", ...deliverables]);
  };

  const handleRemoveDeliverable = (index: number) => {
    const updated = deliverables.filter((_, i) => i !== index);
    setDeliverables(updated.length > 0 ? updated : [""]);
  };

  const handleDeliverableChange = (index: number, val: string) => {
    const updated = [...deliverables];
    updated[index] = val;
    setDeliverables(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a service title.");
      return;
    }

    if (!image.trim()) {
      toast.error("Please upload a cover image for this service.");
      return;
    }

    const finalCategory = category === "Other" ? (customCategory.trim() || "General") : category;
    const cleanDeliverables = deliverables.map((d) => d.trim()).filter(Boolean);

    onSave({
      id: editingService?.id,
      title: title.trim(),
      category: finalCategory,
      price: price.trim() || `$${priceNum}`,
      priceNum: Number(priceNum) || 0,
      deliveryTime: deliveryTime.trim() || "3-5 Business Days",
      badge: badge.trim() || undefined,
      tagline: tagline.trim(),
      description: description.trim(),
      audience: audience.trim(),
      methodology: methodology.trim(),
      image: image.trim(),
      deliverables: cleanDeliverables.length > 0 ? cleanDeliverables : ["Custom Professional Deliverable"],
      isActive,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header: Fixed at top (not scrollable) */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingService ? `Edit Service: ${editingService.title}` : "Add New Service Product"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingService
                ? "Update service specifications, pricing, and deliverables."
                : "Create a new professional service that appears on the website."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with scrollable content and fixed footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
            {/* Active Status Banner */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-800">Public Visibility</p>
              <p className="text-[11px] text-slate-500">
                {isActive ? "Visible on /services and homepage." : "Hidden from public view (Draft mode)."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isActive ? "bg-[#0A54B1]" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Service Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Executive Brand & ATS Positioning"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom Category)</option>
              </select>
            </div>

            {category === "Other" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Custom Category Name</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Promotional Badge</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">No Badge</option>
                {BADGE_PRESETS.filter(Boolean).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={priceNum}
                  onChange={(e) => handlePriceNumChange(Number(e.target.value))}
                  className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Delivery Time</label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="e.g. 3-5 Business Days"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tagline & Description */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Catchy Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Brief one-liner summary for cards"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive explanation of what this service offers..."
                className="w-full text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Target Audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Senior Directors, VPs, and Founders"
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Writing / Brand Methodology</label>
                <input
                  type="text"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  placeholder="e.g. Psycholinguistic Narrative Frameworks"
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card Cover Image (File Upload Only - No Alternatives) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Card Cover Image <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Single image upload</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {image ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md group">
                <div className="h-48 w-full relative">
                  <img
                    src={image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="text-[11px] text-white font-semibold px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Cover Image Ready
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-md hover:bg-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#004AAD]" /> Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer group space-y-2.5 ${
                  isDragging
                    ? "border-[#004AAD] bg-blue-50/60 ring-4 ring-blue-500/10 scale-[1.01]"
                    : "border-slate-300 hover:border-[#004AAD] bg-slate-50/70 hover:bg-blue-50/20"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-[#004AAD] shadow-sm border border-slate-200/80 flex items-center justify-center mx-auto group-hover:scale-105 group-hover:border-blue-300 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#004AAD] transition-colors">
                    Click to browse or drag & drop image here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, JPEG or WEBP (Max 5MB • 16:9 ratio recommended)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Key Deliverables List */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Key Deliverables</label>
                <p className="text-[11px] text-slate-500">List specific items the client will receive.</p>
              </div>
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="text-xs font-bold text-[#004AAD] hover:text-[#004AAD]/80 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Deliverable
              </button>
            </div>

            <div className="space-y-2">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-bold w-4 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                    placeholder={`e.g. 1-on-1 Executive Positioning Interview`}
                    className="flex-1 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove deliverable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Fixed Footer: Always visible, never scrolls away */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer h-9"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-linear-to-r from-[#5DE0E6] to-[#004AAD] text-white font-extrabold text-xs shadow-md shadow-blue-500/15 hover:opacity-95 transition-all cursor-pointer h-9"
            >
              {editingService ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
