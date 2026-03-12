"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100",
        "placeholder:text-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500",
        "transition-colors text-center text-lg tracking-widest",
        className
      )}
      {...props}
    />
  );
}
