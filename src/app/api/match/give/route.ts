import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  getPlayerId,
  errorResponse,
  successResponse,
  getMatch,
  getCurrentRound,
  broadcastStateChange,
} from "@/lib/api-helpers";
import { validateGiveCardSubmission, validatePlayerInMatch, validatePhase, validateNotAlreadySubmitted } from "@/game/validator";
import { PHASE_TIMER_SEC } from "@/consts/game";
import type { GameMode } from "@/types";

export async function POST(request: NextRequest) {
  const playerId = getPlayerId(request);
  if (!playerId) return errorResponse("Missing player ID", 401);

  const body = await request.json();
  const { matchId, card } = body;
  if (!matchId || card === undefined) return errorResponse("Missing matchId or card");

  const match = await getMatch(matchId);
  if (!match) return errorResponse("Match not found", 404);

  const playerCheck = validatePlayerInMatch(playerId, match);
  if (!playerCheck.valid) return errorResponse(playerCheck.error!);

  const phaseCheck = validatePhase(match, "GIVE");
  if (!phaseCheck.valid) return errorResponse(phaseCheck.error!);

  const round = await getCurrentRound(matchId, match.current_round);
  if (!round) return errorResponse("Round not found");

  const amIPlayer1 = playerId === match.player1_id;
  const prefix = amIPlayer1 ? "player1" : "player2";

  const submitCheck = validateNotAlreadySubmitted(round, playerId, match, "give_card");
  if (!submitCheck.valid) return errorResponse(submitCheck.error!);

  const mode = round.mode as GameMode;
  const cardCheck = validateGiveCardSubmission(card, mode);
  if (!cardCheck.valid) return errorResponse(cardCheck.error!);

  const supabase = getSupabaseAdmin();

  // Store give card
  await supabase
    .from("rounds")
    .update({ [`${prefix}_give_card`]: card, updated_at: new Date().toISOString() })
    .eq("id", round.id);

  // Check if both submitted
  const oppPrefix = amIPlayer1 ? "player2" : "player1";
  const oppGiveCard = round[`${oppPrefix}_give_card`] as number | null;

  if (oppGiveCard !== null) {
    // Both submitted - advance to USE
    const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();
    await supabase
      .from("matches")
      .update({
        current_phase: "USE",
        phase_deadline: deadline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId);
  }

  await broadcastStateChange(matchId);
  return successResponse({ phaseAdvanced: oppGiveCard !== null });
}
