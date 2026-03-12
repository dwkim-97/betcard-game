import { isValidBet, isValidCard, isValidUseCard } from "./engine";
import type { GameMode, MatchRow, RoundRow, Phase } from "@/types";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBetSubmission(
  bet: number,
  pool: number,
  mode: GameMode
): ValidationResult {
  if (!isValidBet(bet, pool, mode)) {
    return { valid: false, error: `Invalid bet: ${bet} (pool: ${pool}, mode: ${mode})` };
  }
  return { valid: true };
}

export function validateGiveCardSubmission(
  card: number,
  mode: GameMode
): ValidationResult {
  if (!isValidCard(card, mode)) {
    return { valid: false, error: `Invalid give card: ${card} (mode: ${mode})` };
  }
  return { valid: true };
}

export function validateUseCardSubmission(
  useCard: number,
  giveCard: number,
  mode: GameMode
): ValidationResult {
  if (!isValidUseCard(useCard, giveCard, mode)) {
    return {
      valid: false,
      error: `Invalid use card: ${useCard} (give: ${giveCard}, mode: ${mode})`,
    };
  }
  return { valid: true };
}

export function validatePlayerInMatch(
  playerId: string,
  match: MatchRow
): ValidationResult {
  if (playerId !== match.player1_id && playerId !== match.player2_id) {
    return { valid: false, error: "Player not in this match" };
  }
  return { valid: true };
}

export function validatePhase(
  match: MatchRow,
  expectedPhase: Phase
): ValidationResult {
  if (match.status !== "PLAYING") {
    return { valid: false, error: "Match is not in progress" };
  }
  if (match.current_phase !== expectedPhase) {
    return {
      valid: false,
      error: `Expected phase ${expectedPhase}, got ${match.current_phase}`,
    };
  }
  return { valid: true };
}

export function validateNotAlreadySubmitted(
  round: RoundRow,
  playerId: string,
  match: MatchRow,
  field: "bet" | "give_card" | "use_card"
): ValidationResult {
  const prefix = playerId === match.player1_id ? "player1" : "player2";
  const key = `${prefix}_${field}` as keyof RoundRow;
  if (round[key] !== null) {
    return { valid: false, error: `Already submitted ${field}` };
  }
  return { valid: true };
}

export function isPhaseExpired(phaseDeadline: string | null): boolean {
  if (!phaseDeadline) return false;
  return new Date() > new Date(phaseDeadline);
}
