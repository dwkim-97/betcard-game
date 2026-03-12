"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
        variant === "primary" &&
          "bg-amber-500 text-gray-900 hover:bg-amber-400",
        variant === "secondary" &&
          "bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600",
        variant === "ghost" &&
          "bg-transparent text-gray-300 hover:bg-gray-800",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
