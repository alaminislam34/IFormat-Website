import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient" | "dark" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A54B1]/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          {
            "bg-[#0A54B1] text-white hover:bg-[#08428C] shadow-md shadow-blue-500/15 active:scale-[0.98]":
              variant === "primary",
            "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]":
              variant === "secondary",
            "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs active:scale-[0.98]":
              variant === "outline",
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]":
              variant === "ghost",
            "bg-linear-to-r from-[#00c6ff] to-[#0A54B1] text-white hover:opacity-95 shadow-md shadow-blue-500/20 active:scale-[0.98]":
              variant === "gradient",
            "bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-[0.98]":
              variant === "dark",
            "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/15 active:scale-[0.98]":
              variant === "danger",
            "h-10 px-5 py-2": size === "md",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 rounded-2xl px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
