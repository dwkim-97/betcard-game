"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const TIMER_TICK_MS = 100;

export function usePhaseTimer(
  phaseDeadline: string | null,
  onExpired?: () => void
) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const expiredCallbackRef = useRef(onExpired);
  const hasFiredRef = useRef(false);

  expiredCallbackRef.current = onExpired;

  useEffect(() => {
    hasFiredRef.current = false;
  }, [phaseDeadline]);

  useEffect(() => {
    if (!phaseDeadline) {
      setRemainingMs(0);
      return;
    }

    const deadline = new Date(phaseDeadline).getTime();

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      setRemainingMs(remaining);

      if (remaining <= 0 && !hasFiredRef.current) {
        hasFiredRef.current = true;
        expiredCallbackRef.current?.();
      }
    };

    tick();
    const interval = setInterval(tick, TIMER_TICK_MS);
    return () => clearInterval(interval);
  }, [phaseDeadline]);

  const remainingSec = Math.ceil(remainingMs / 1000);
  const isExpired = remainingMs <= 0 && phaseDeadline !== null;
  const totalMs = phaseDeadline
    ? Math.max(1, new Date(phaseDeadline).getTime() - (new Date(phaseDeadline).getTime() - 20000))
    : 1;
  const progress = phaseDeadline ? Math.min(1, remainingMs / 20000) : 0;

  return { remainingMs, remainingSec, isExpired, progress };
}
