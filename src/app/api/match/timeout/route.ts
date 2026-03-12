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
import { isPhaseExpired } from "@/game/validator";
import { autoPickBet, autoPickGiveCard, autoPickUseCard } from "@/game/auto-pick";
import { processRoundResolution } from "@/game/resolver";
import { determineFirstPlayer, coinToss } from "@/game/engine";
import { PHASE_TIMER_SEC, BET_TIE_MAX_REBIDS, INITIAL_POOL } from "@/consts/game";
import type { GameMode } from "@/types";

export async function POST(request: NextRequest) {
  const playerId = getPlayerId(request);
  if (!playerId) return errorResponse("Missing player ID", 401);

  const body = await request.json();
  const { matchId } = body;
  if (!matchId) return errorResponse("Missing matchId");

  const match = await getMatch(matchId);
  if (!match) return errorResponse("Match not found", 404);
  if (match.status !== "PLAYING") return errorResponse("Match not in progress");

  // Only process if deadline has passed
  if (!isPhaseExpired(match.phase_deadline)) {
    return successResponse({ processed: false, reason: "Deadline not expired" });
  }

  const round = await getCurrentRound(matchId, match.current_round);
  if (!round) return errorResponse("Round not found");

  const supabase = getSupabaseAdmin();
  const mode = round.mode as GameMode;
  const phase = match.current_phase;

  if (phase === "BET" || phase === "BET_REBID") {
    // Auto-pick bet for players who haven't submitted
    const p1Bet = round.player1_bet ?? autoPickBet(mode);
    const p2Bet = round.player2_bet ?? autoPickBet(mode);

    await supabase
      .from("rounds")
      .update({
        player1_bet: p1Bet,
        player2_bet: p2Bet,
        updated_at: new Date().toISOString(),
      })
      .eq("id", round.id);

    // Handle bet tie
    if (p1Bet === p2Bet) {
      if (round.bet_tie_count < BET_TIE_MAX_REBIDS) {
        // Rebid
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
        return successResponse({ processed: true, result: "rebid" });
      } else {
        // Coin toss
        const firstPlayerId = coinToss(match.player1_id, match.player2_id!);
        await supabase
          .from("rounds")
          .update({ first_player_id: firstPlayerId, updated_at: new Date().toISOString() })
          .eq("id", round.id);
      }
    } else {
      const firstPlayerId = determineFirstPlayer(p1Bet, p2Bet, match.player1_id, match.player2_id!);
      await supabase
        .from("rounds")
        .update({ first_player_id: firstPlayerId, updated_at: new Date().toISOString() })
        .eq("id", round.id);
    }

    // Deduct pools and advance to GIVE
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
    return successResponse({ processed: true, result: "advanced_to_give" });
  }

  if (phase === "GIVE") {
    const p1Give = round.player1_give_card ?? autoPickGiveCard(mode);
    const p2Give = round.player2_give_card ?? autoPickGiveCard(mode);

    await supabase
      .from("rounds")
      .update({
        player1_give_card: p1Give,
        player2_give_card: p2Give,
        updated_at: new Date().toISOString(),
      })
      .eq("id", round.id);

    const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();
    await supabase
      .from("matches")
      .update({
        current_phase: "USE",
        phase_deadline: deadline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    await broadcastStateChange(matchId);
    return successResponse({ processed: true, result: "advanced_to_use" });
  }

  if (phase === "USE") {
    // Auto-pick use card for players who haven't submitted
    const p1Give = round.player1_give_card!;
    const p2Give = round.player2_give_card!;
    const p1Use = round.player1_use_card ?? autoPickUseCard(p1Give, mode);
    const p2Use = round.player2_use_card ?? autoPickUseCard(p2Give, mode);

    await supabase
      .from("rounds")
      .update({
        player1_use_card: p1Use,
        player2_use_card: p2Use,
        updated_at: new Date().toISOString(),
      })
      .eq("id", round.id);

    // Resolve
    const updatedRound = {
      ...round,
      player1_use_card: p1Use,
      player2_use_card: p2Use,
      player1_give_card: p1Give,
      player2_give_card: p2Give,
    };

    const { matchUpdates, roundUpdates, nextAction, nextRoundMode } =
      processRoundResolution(match, updatedRound);

    await supabase.from("rounds").update(roundUpdates).eq("id", round.id);
    await supabase.from("matches").update(matchUpdates).eq("id", matchId);

    if (nextAction === "NEXT_ROUND" || nextAction === "SUDDEN_DEATH") {
      const nextRoundNumber = nextAction === "SUDDEN_DEATH" ? 4 : match.current_round + 1;
      const deadline = new Date(Date.now() + PHASE_TIMER_SEC * 1000).toISOString();

      await supabase.from("rounds").insert({
        match_id: matchId,
        round_number: nextRoundNumber,
        mode: nextRoundMode || "NORMAL",
      });

      const sdPoolUpdates =
        nextAction === "SUDDEN_DEATH"
          ? { player1_pool: INITIAL_POOL, player2_pool: INITIAL_POOL }
          : {};

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

    await broadcastStateChange(matchId);
    return successResponse({ processed: true, result: "resolved" });
  }

  return successResponse({ processed: false, reason: "No action needed" });
}
