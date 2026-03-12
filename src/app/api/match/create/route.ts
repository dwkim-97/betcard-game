import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { INVITE_CODE_LENGTH, INITIAL_POOL } from "@/consts/game";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const nickname = body.nickname?.trim() || "Player 1";
  const playerId = request.headers.get("x-player-id") || uuidv4();

  const supabase = getSupabaseAdmin();
  const inviteCode = generateInviteCode();

  const { data, error } = await supabase
    .from("matches")
    .insert({
      invite_code: inviteCode,
      status: "WAITING",
      player1_id: playerId,
      player1_nickname: nickname,
      player1_pool: INITIAL_POOL,
      player2_pool: INITIAL_POOL,
      current_round: 0,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    matchId: data.id,
    inviteCode,
    playerId,
  });
}
