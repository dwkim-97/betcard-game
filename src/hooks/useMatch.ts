"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { fetchGameState } from "@/lib/api";
import { POLLING_INTERVAL_MS } from "@/consts/game";
import type { GameStateResponse } from "@/types";

export function useMatch(matchId: string | null, playerId: string) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef<string>("");

  const refetch = useCallback(async () => {
    if (!matchId || !playerId) return;
    try {
      const state = await fetchGameState(playerId, matchId);
      setGameState(state);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch game state");
    } finally {
      setLoading(false);
    }
  }, [matchId, playerId]);

  // Initial fetch
  useEffect(() => {
    if (matchId && playerId) {
      refetch();
    }
  }, [matchId, playerId, refetch]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!matchId || !playerId) return;

    const supabase = getSupabaseClient();
    const channel = supabase.channel(`match:${matchId}`);

    channel
      .on("broadcast", { event: "state_changed" }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, playerId, refetch]);

  // Polling fallback
  useEffect(() => {
    if (!matchId || !playerId) return;

    const interval = setInterval(() => {
      refetch();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [matchId, playerId, refetch]);

  return { gameState, loading, error, refetch };
}
