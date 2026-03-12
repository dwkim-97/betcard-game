import { resolveRound as resolveRoundEngine, needsSuddenDeath, determineMatchWinner } from "./engine";
import type { MatchRow, RoundRow, RoundResolution, GameMode } from "@/types";
import { SUDDEN_DEATH_ROUND, MAX_ROUNDS_NORMAL } from "@/consts/game";

/** Run full round resolution and return what to update */
export function processRoundResolution(
  match: MatchRow,
  round: RoundRow
): {
  resolution: RoundResolution;
  matchUpdates: Partial<MatchRow>;
  roundUpdates: Partial<RoundRow>;
  nextAction: "NEXT_ROUND" | "SUDDEN_DEATH" | "MATCH_END";
  nextRoundMode?: GameMode;
} {
  const resolution = resolveRoundEngine({
    roundNumber: round.round_number,
    mode: round.mode,
    p1Bet: round.player1_bet!,
    p2Bet: round.player2_bet!,
    p1GiveCard: round.player1_give_card!,
    p2GiveCard: round.player2_give_card!,
    p1UseCard: round.player1_use_card!,
    p2UseCard: round.player2_use_card!,
    player1Id: match.player1_id,
    player2Id: match.player2_id!,
  });

  const p1TotalDelta =
    resolution.player1RoundScore + resolution.player1BetScore + resolution.player1PredictionBonus;
  const p2TotalDelta =
    resolution.player2RoundScore + resolution.player2BetScore + resolution.player2PredictionBonus;

  const newP1Total = match.player1_total_score + p1TotalDelta;
  const newP2Total = match.player2_total_score + p2TotalDelta;

  const roundUpdates: Partial<RoundRow> = {
    player1_result: resolution.player1Result,
    player2_result: resolution.player2Result,
    player1_round_score: resolution.player1RoundScore,
    player2_round_score: resolution.player2RoundScore,
    player1_bet_score: resolution.player1BetScore,
    player2_bet_score: resolution.player2BetScore,
    player1_prediction_bonus: resolution.player1PredictionBonus,
    player2_prediction_bonus: resolution.player2PredictionBonus,
    resolved: true,
    updated_at: new Date().toISOString(),
  };

  // Determine next action
  let nextAction: "NEXT_ROUND" | "SUDDEN_DEATH" | "MATCH_END";
  let nextRoundMode: GameMode | undefined;

  if (round.mode === "SUDDEN_DEATH") {
    // After sudden death, always end (draw allowed)
    nextAction = "MATCH_END";
  } else if (round.round_number >= MAX_ROUNDS_NORMAL) {
    // After round 3
    if (needsSuddenDeath(newP1Total, newP2Total, round.round_number)) {
      nextAction = "SUDDEN_DEATH";
      nextRoundMode = "SUDDEN_DEATH";
    } else {
      nextAction = "MATCH_END";
    }
  } else {
    nextAction = "NEXT_ROUND";
    nextRoundMode = "NORMAL";
  }

  const matchUpdates: Partial<MatchRow> = {
    player1_total_score: newP1Total,
    player2_total_score: newP2Total,
    current_phase: "ROUND_END",
    updated_at: new Date().toISOString(),
  };

  if (nextAction === "MATCH_END") {
    matchUpdates.status = "FINISHED";
    matchUpdates.winner_id = determineMatchWinner(newP1Total, newP2Total, match.player1_id, match.player2_id!);
    matchUpdates.current_phase = null;
  }

  return { resolution, matchUpdates, roundUpdates, nextAction, nextRoundMode };
}
