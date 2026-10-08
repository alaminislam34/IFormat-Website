"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/api-client";
import { toast } from "sonner";
import { LeaderMember } from "@/stores/use-landing-content-store";

interface LeaderEditorModalProps {
  isOpen: boolean;
  editingLeader: LeaderMember | null;
  onClose: () => void;
  onSave: (leaderData: { name: string; role: string; image: string }) => void;
}

export function LeaderEditorModal({
  isOpen,
  editingLeader,
  onClose,
  onSave,
}: LeaderEditorModalProps) {
  const [formData, setFormData] = useState({ name: "", role: "", image: "" });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingLeader) {
      setFormData({
        name: editingLeader.name,
        role: editingLeader.role,
        image: editingLeader.image,
      });
    } else {
      setFormData({ name: "", role: "", image: "" });
    }
  }, [editingLeader, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);

      const res = await apiClient.post<any>("/upload/media", data);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        toast.success("Leader photo uploaded!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error("Please enter both a name and role.");
      return;
    }
    onSave({
      name: formData.name.trim(),
      role: formData.role.trim(),
      image: formData.image.trim() || "/leaders/Jessica - Founder.png",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingLeader ? "Edit Leader Profile" : "Add Leadership Team Member"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update photo, name, and executive designation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt="Leader Preview"
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full text-xs font-semibold rounded-xl cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload New Photo
                  </>
                )}
              </Button>
              <p className="text-[11px] text-slate-400 leading-tight">
                Recommended: 3:4 portrait photo (JPG, PNG, WebP).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Photo Path or URL
            </label>
            <input
              type="text"
              required
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="/leaders/Jessica - Founder.png"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Jessica"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role / Executive Title
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              placeholder="e.g. Founder & Managing Director"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-semibold px-5 cursor-pointer"
            >
              {editingLeader ? "Save Changes" : "Add Leader"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
