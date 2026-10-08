"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface AdminServiceStatusDropdownProps {
  serviceId: string;
  isActive: boolean;
  onToggleStatus: (id: string) => void;
}

export function AdminServiceStatusDropdown({
  serviceId,
  isActive,
  onToggleStatus,
}: AdminServiceStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; openUpwards: boolean }>({
    top: 0,
    left: 0,
    openUpwards: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const top = openUpwards ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - 220);

    setCoords({ top, left, openUpwards });
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
        className={`px-2.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80"
        }`}
        title="Click to change status"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          }`}
        />
        <span>{isActive ? "Published" : "Draft / Hidden"}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-99999 w-52 rounded-2xl bg-white border border-slate-200/95 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Change Visibility
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isActive) onToggleStatus(serviceId);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-bold"
                  : "hover:bg-slate-100 text-slate-700 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="leading-tight">Published</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Visible on storefront
                  </div>
                </div>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (isActive) onToggleStatus(serviceId);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                !isActive
                  ? "bg-slate-100 text-slate-800 font-bold"
                  : "hover:bg-slate-100 text-slate-700 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <div>
                  <div className="leading-tight">Draft / Hidden</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Hidden from storefront
                  </div>
                </div>
              </div>
              {!isActive && <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
