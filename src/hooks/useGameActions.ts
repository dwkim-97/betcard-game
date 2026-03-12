"use client";

import { useState, useCallback } from "react";
import * as api from "@/lib/api";

export function useGameActions(matchId: string | null, playerId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const wrapAction = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      if (!matchId || !playerId) return null;
      setIsSubmitting(true);
      setLastError(null);
      try {
        const result = await action();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Action failed";
        setLastError(msg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [matchId, playerId]
  );

  const submitBet = useCallback(
    (bet: number) => wrapAction(() => api.submitBet(playerId, matchId!, bet)),
    [wrapAction, playerId, matchId]
  );

  const submitGiveCard = useCallback(
    (card: number) => wrapAction(() => api.submitGiveCard(playerId, matchId!, card)),
    [wrapAction, playerId, matchId]
  );

  const submitUseCard = useCallback(
    (card: number) => wrapAction(() => api.submitUseCard(playerId, matchId!, card)),
    [wrapAction, playerId, matchId]
  );

  const handleTimeout = useCallback(
    () => wrapAction(() => api.triggerTimeout(playerId, matchId!)),
    [wrapAction, playerId, matchId]
  );

  return { submitBet, submitGiveCard, submitUseCard, handleTimeout, isSubmitting, lastError };
}
