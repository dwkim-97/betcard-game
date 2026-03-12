import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase-server";
import type { MatchRow, RoundRow } from "@/types";

export function getPlayerId(request: NextRequest): string | null {
  return request.headers.get("x-player-id");
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function successResponse(data: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, ...data });
}

export async function getMatch(matchId: string): Promise<MatchRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("matches").select("*").eq("id", matchId).single();
  return data;
}

export async function getCurrentRound(matchId: string, roundNumber: number): Promise<RoundRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("rounds")
    .select("*")
    .eq("match_id", matchId)
    .eq("round_number", roundNumber)
    .single();
  return data;
}

export async function broadcastStateChange(matchId: string) {
  const supabase = getSupabaseAdmin();
  const channel = supabase.channel(`match:${matchId}`);
  await channel.send({
    type: "broadcast",
    event: "state_changed",
    payload: { ts: Date.now() },
  });
  supabase.removeChannel(channel);
}
