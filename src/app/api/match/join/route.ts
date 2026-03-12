import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { broadcastStateChange } from "@/lib/api-helpers";
import { PHASE_TIMER_SEC } from "@/consts/game";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const inviteCode = body.inviteCode?.trim()?.toUpperCase();
  const nickname = body.nickname?.trim() || "Player 2";
  const playerId = request.headers.get("x-player-id") || uuidv4();

  if (!inviteCode) {
    return NextResponse.json({ success: false, error: "Invite code required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Find waiting match
  const { data: match, error: findError } = await supabase
    .from("matches")
    .select("*")
    .eq("invite_code", inviteCode)
    .eq("status", "WAITING")
    .single();

  if (findError || !match) {
    return NextResponse.json({ success: false, error: "Match not found or already started" }, { status: 404 });
  }

  if (match.player1_id === playerId) {
    return NextResponse.json({ success: false, error: "Cannot join your own match" }, { status: 400 });
  }

  const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();

  // Update match to PLAYING, set player2, start round 1
  const { error: updateError } = await supabase
    .from("matches")
    .update({
      player2_id: playerId,
      player2_nickname: nickname,
      status: "PLAYING",
      current_round: 1,
      current_phase: "BET",
      phase_deadline: deadline,
      updated_at: new Date().toISOString(),
    })
    .eq("id", match.id);

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  // Create round 1
  const { error: roundError } = await supabase.from("rounds").insert({
    match_id: match.id,
    round_number: 1,
    mode: "NORMAL",
  });

  if (roundError) {
    return NextResponse.json({ success: false, error: roundError.message }, { status: 500 });
  }

  await broadcastStateChange(match.id);

  return NextResponse.json({
    success: true,
    matchId: match.id,
    playerId,
  });
}
