"use client";

import { cn } from "@/lib/utils";
import type { CardColor } from "@/consts/cards";

interface CardDisplayProps {
  value?: number | null;
  color?: CardColor | null;
  hidden?: boolean;
  selected?: boolean;
  disabled?: boolean;
  dimmed?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function CardDisplay({
  value,
  color,
  hidden = false,
  selected = false,
  disabled = false,
  dimmed = false,
  size = "md",
  onClick,
}: CardDisplayProps) {
  const isBlack = color === "BLACK" || (value !== null && value !== undefined && [-1, 2].includes(value));
  const isWhite = color === "WHITE" || (value !== null && value !== undefined && [0, 1].includes(value));

  const sizeClasses = {
    sm: "w-12 h-16 text-lg",
    md: "w-16 h-22 text-2xl",
    lg: "w-20 h-28 text-3xl",
  };

  if (hidden) {
    return (
      <div
        className={cn(
          "rounded-xl border-2 flex items-center justify-center font-bold",
          "bg-indigo-950 border-indigo-800 text-indigo-400",
          "select-none",
          sizeClasses[size],
          onClick && !disabled && "cursor-pointer active:scale-95 hover:border-indigo-600",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={!disabled ? onClick : undefined}
      >
        ?
      </div>
    );
  }

  // Color-only card (received card R1-R2)
  if (value === null || value === undefined) {
    if (color) {
      return (
        <div
          className={cn(
            "rounded-xl border-2 flex items-center justify-center",
            "select-none",
            sizeClasses[size],
            isBlack && "bg-gray-900 border-gray-600",
            isWhite && "bg-gray-200 border-gray-400",
          )}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-sm",
              isBlack && "bg-gray-700",
              isWhite && "bg-gray-400",
            )}
          />
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border-2 flex flex-col items-center justify-center font-bold relative",
        "select-none transition-all",
        sizeClasses[size],
        isBlack && "bg-gray-900 border-gray-600 text-gray-100",
        isWhite && "bg-gray-200 border-gray-400 text-gray-900",
        selected && "ring-2 ring-amber-400 border-amber-400 scale-105 -translate-y-1",
        dimmed && "opacity-30",
        onClick && !disabled && !dimmed && "cursor-pointer active:scale-95 hover:scale-105 hover:-translate-y-0.5",
        disabled && "cursor-not-allowed",
      )}
      onClick={!disabled && !dimmed ? onClick : undefined}
    >
      <span className="text-xs absolute top-1 left-2 opacity-60">
        {value > 0 ? `+${value}` : value}
      </span>
      <span>{value > 0 ? `+${value}` : value}</span>
      <span className={cn("text-[10px] mt-0.5", isBlack ? "text-gray-400" : "text-gray-600")}>
        {isBlack ? "BLACK" : "WHITE"}
      </span>
    </div>
  );
}
