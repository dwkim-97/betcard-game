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
import { validateUseCardSubmission, validatePlayerInMatch, validatePhase, validateNotAlreadySubmitted } from "@/game/validator";
import { processRoundResolution } from "@/game/resolver";
import { PHASE_TIMER_SEC, INITIAL_POOL } from "@/consts/game";
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

  const phaseCheck = validatePhase(match, "USE");
  if (!phaseCheck.valid) return errorResponse(phaseCheck.error!);

  const round = await getCurrentRound(matchId, match.current_round);
  if (!round) return errorResponse("Round not found");

  const amIPlayer1 = playerId === match.player1_id;
  const prefix = amIPlayer1 ? "player1" : "player2";

  const submitCheck = validateNotAlreadySubmitted(round, playerId, match, "use_card");
  if (!submitCheck.valid) return errorResponse(submitCheck.error!);

  // Validate use card != give card
  const myGiveCard = round[`${prefix}_give_card`] as number;
  const mode = round.mode as GameMode;
  const cardCheck = validateUseCardSubmission(card, myGiveCard, mode);
  if (!cardCheck.valid) return errorResponse(cardCheck.error!);

  const supabase = getSupabaseAdmin();

  // Store use card
  await supabase
    .from("rounds")
    .update({ [`${prefix}_use_card`]: card, updated_at: new Date().toISOString() })
    .eq("id", round.id);

  // Check if both submitted
  const oppPrefix = amIPlayer1 ? "player2" : "player1";
  const oppUseCard = round[`${oppPrefix}_use_card`] as number | null;

  if (oppUseCard !== null) {
    // Both submitted - resolve round
    // Re-fetch round with our update
    const updatedRound = await getCurrentRound(matchId, match.current_round);
    if (!updatedRound) return errorResponse("Round not found after update");

    // Set our use card on the round data for resolution
    const roundForResolve = {
      ...updatedRound,
      [`${prefix}_use_card`]: card,
    };

    const { resolution, matchUpdates, roundUpdates, nextAction, nextRoundMode } =
      processRoundResolution(match, roundForResolve);

    // Update round
    await supabase.from("rounds").update(roundUpdates).eq("id", round.id);

    // Update match
    await supabase.from("matches").update(matchUpdates).eq("id", matchId);

    // If we need to start a new round
    if (nextAction === "NEXT_ROUND" || nextAction === "SUDDEN_DEATH") {
      const nextRoundNumber = nextAction === "SUDDEN_DEATH" ? 4 : match.current_round + 1;
      const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();

      // Create next round
      await supabase.from("rounds").insert({
        match_id: matchId,
        round_number: nextRoundNumber,
        mode: nextRoundMode || "NORMAL",
      });

      // Reset pools for sudden death
      const sdPoolUpdates =
        nextAction === "SUDDEN_DEATH"
          ? { player1_pool: INITIAL_POOL, player2_pool: INITIAL_POOL }
          : {};

      // Advance match to next round
      await supabase
        .from("matches")
        .update({
          current_round: nextRoundNumber,
          current_phase: "BET",
          phase_deadline: deadline,
          ...sdPoolUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId);
    }
  }

  await broadcastStateChange(matchId);
  return successResponse({ phaseAdvanced: oppUseCard !== null });
}
