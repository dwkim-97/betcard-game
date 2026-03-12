"use client";

import { cn } from "@/lib/utils";

const TIMER_WARN_SEC = 10;
const TIMER_DANGER_SEC = 5;

interface PhaseTimerProps {
  remainingSec: number;
  progress: number;
}

export function PhaseTimer({ remainingSec, progress }: PhaseTimerProps) {
  const colorClass =
    remainingSec <= TIMER_DANGER_SEC
      ? "bg-red-500"
      : remainingSec <= TIMER_WARN_SEC
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="w-full px-4 py-1">
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-100", colorClass)}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="text-center mt-1">
        <span
          className={cn(
            "text-sm font-mono font-bold",
            remainingSec <= TIMER_DANGER_SEC
              ? "text-red-400"
              : remainingSec <= TIMER_WARN_SEC
                ? "text-amber-400"
                : "text-gray-400"
          )}
        >
          {remainingSec}s
        </span>
      </div>
    </div>
  );
}
