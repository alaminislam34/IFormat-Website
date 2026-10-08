"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Star,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { ServiceProductWithStatus } from "@/stores/use-services-store";

interface AdminServiceActionDropdownProps {
  service: ServiceProductWithStatus;
  top3Slot: number;
  onEdit: (service: ServiceProductWithStatus) => void;
  onPreview: (service: ServiceProductWithStatus) => void;
  onDeleteConfirm: (service: ServiceProductWithStatus) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onPinToTop?: (id: string) => void;
}

export function AdminServiceActionDropdown({
  service,
  top3Slot,
  onEdit,
  onPreview,
  onDeleteConfirm,
  onMove,
  onPinToTop,
}: AdminServiceActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const top = openUpwards ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
    const left = Math.max(12, rect.right - 180);

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleScrollOrResize = () => setIsOpen(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? "bg-slate-100 border-slate-300 text-slate-900"
            : "bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300"
        }`}
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-99999 w-44 rounded-2xl bg-white border border-slate-200/95 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={() => {
                onPreview(service);
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0A54B1] hover:bg-sky-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onEdit(service);
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[#0A54B1] hover:bg-sky-50 flex items-center gap-2 transition-colors cursor-pointer font-bold"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#0A54B1]" />
              <span>Edit Service</span>
            </button>

            {onPinToTop && top3Slot !== 0 && (
              <button
                type="button"
                onClick={() => {
                  onPinToTop(service.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-sky-700 hover:bg-sky-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
                <span>Pin to Homepage #1</span>
              </button>
            )}

            {onMove && (
              <div className="flex items-center gap-1 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    onMove(service.id, "up");
                    setIsOpen(false);
                  }}
                  className="flex-1 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" /> Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onMove(service.id, "down");
                    setIsOpen(false);
                  }}
                  className="flex-1 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" /> Down
                </button>
              </div>
            )}

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                onDeleteConfirm(service);
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete Service</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
