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
import { validateBetSubmission, validatePlayerInMatch, validatePhase, validateNotAlreadySubmitted } from "@/game/validator";
import { determineFirstPlayer, coinToss } from "@/game/engine";
import { PHASE_TIMER_SEC, BET_TIE_MAX_REBIDS } from "@/consts/game";
import type { GameMode } from "@/types";

export async function POST(request: NextRequest) {
  const playerId = getPlayerId(request);
  if (!playerId) return errorResponse("Missing player ID", 401);

  const body = await request.json();
  const { matchId, bet } = body;
  if (!matchId || bet === undefined) return errorResponse("Missing matchId or bet");

  const match = await getMatch(matchId);
  if (!match) return errorResponse("Match not found", 404);

  const playerCheck = validatePlayerInMatch(playerId, match);
  if (!playerCheck.valid) return errorResponse(playerCheck.error!);

  // Accept both BET and BET_REBID phases
  if (match.current_phase !== "BET" && match.current_phase !== "BET_REBID") {
    return errorResponse(`Expected BET phase, got ${match.current_phase}`);
  }

  const round = await getCurrentRound(matchId, match.current_round);
  if (!round) return errorResponse("Round not found");

  const amIPlayer1 = playerId === match.player1_id;
  const prefix = amIPlayer1 ? "player1" : "player2";

  // Check not already submitted
  const submitCheck = validateNotAlreadySubmitted(round, playerId, match, "bet");
  if (!submitCheck.valid) return errorResponse(submitCheck.error!);

  // Validate bet value
  const pool = amIPlayer1 ? match.player1_pool : match.player2_pool;
  const mode = round.mode as GameMode;
  const betCheck = validateBetSubmission(bet, pool, mode);
  if (!betCheck.valid) return errorResponse(betCheck.error!);

  const supabase = getSupabaseAdmin();

  // Store bet
  await supabase
    .from("rounds")
    .update({ [`${prefix}_bet`]: bet, updated_at: new Date().toISOString() })
    .eq("id", round.id);

  // Check if both players submitted
  const oppPrefix = amIPlayer1 ? "player2" : "player1";
  const oppBet = round[`${oppPrefix}_bet`] as number | null;

  if (oppBet !== null) {
    // Both submitted - check for tie
    if (bet === oppBet) {
      if (round.bet_tie_count < BET_TIE_MAX_REBIDS) {
        // Rebid: reset bets, increment tie count, no pool deduction
        await supabase
          .from("rounds")
          .update({
            player1_bet: null,
            player2_bet: null,
            bet_tie_count: round.bet_tie_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", round.id);

        const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();
        await supabase
          .from("matches")
          .update({
            current_phase: "BET_REBID",
            phase_deadline: deadline,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchId);

        await broadcastStateChange(matchId);
        return successResponse({ betTied: true, phaseAdvanced: false });
      } else {
        // Second tie - coin toss
        const firstPlayerId = coinToss(match.player1_id, match.player2_id!);
        await supabase
          .from("rounds")
          .update({
            first_player_id: firstPlayerId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", round.id);

        // Deduct pools and advance to GIVE
        const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();
        await supabase
          .from("matches")
          .update({
            player1_pool: match.player1_pool - (round.player1_bet ?? bet),
            player2_pool: match.player2_pool - (round.player2_bet ?? bet),
            current_phase: "GIVE",
            phase_deadline: deadline,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchId);

        await broadcastStateChange(matchId);
        return successResponse({ phaseAdvanced: true });
      }
    } else {
      // Different bets - determine first player, deduct pools, advance to GIVE
      const firstPlayerId = determineFirstPlayer(
        amIPlayer1 ? bet : oppBet,
        amIPlayer1 ? oppBet : bet,
        match.player1_id,
        match.player2_id!
      );

      await supabase
        .from("rounds")
        .update({
          first_player_id: firstPlayerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", round.id);

      const p1Bet = amIPlayer1 ? bet : oppBet;
      const p2Bet = amIPlayer1 ? oppBet : bet;

      const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();
      await supabase
        .from("matches")
        .update({
          player1_pool: match.player1_pool - p1Bet,
          player2_pool: match.player2_pool - p2Bet,
          current_phase: "GIVE",
          phase_deadline: deadline,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId);

      await broadcastStateChange(matchId);
      return successResponse({ phaseAdvanced: true });
    }
  }

  // Only one player submitted so far
  await broadcastStateChange(matchId);
  return successResponse({ phaseAdvanced: false });
}
