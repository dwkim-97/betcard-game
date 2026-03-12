import { NORMAL_CARDS, SUDDEN_DEATH_CARDS, SUDDEN_DEATH_BETS } from "@/consts/cards";
import {
  ROUND_SCORES,
  HIGH_BET_FIRST,
  MAX_ROUNDS_NORMAL,
  BOTH_ZERO_BONUS,
  BOTH_NEGATIVE_BONUS,
  BET_MULTIPLIER_BOTH_NEGATIVE,
} from "@/consts/game";
import type { GameMode, RoundResolution } from "@/types";

/** Get available cards for a round based on mode */
export function getAvailableCards(mode: GameMode): readonly number[] {
  return mode === "SUDDEN_DEATH" ? SUDDEN_DEATH_CARDS : NORMAL_CARDS;
}

/** Get valid bet range for normal mode */
export function getMaxBet(pool: number): number {
  return pool;
}

/** Check if bet is valid */
export function isValidBet(bet: number, pool: number, mode: GameMode): boolean {
  if (mode === "SUDDEN_DEATH") {
    return (SUDDEN_DEATH_BETS as readonly number[]).includes(bet);
  }
  return Number.isInteger(bet) && bet >= 0 && bet <= pool;
}

/** Check if a card is valid for the current mode */
export function isValidCard(card: number, mode: GameMode): boolean {
  const available = getAvailableCards(mode);
  return (available as readonly number[]).includes(card);
}

/** Check if give and use cards are different */
export function isValidUseCard(useCard: number, giveCard: number, mode: GameMode): boolean {
  return isValidCard(useCard, mode) && useCard !== giveCard;
}

/** Determine who goes first based on bets */
export function determineFirstPlayer(
  bet1: number,
  bet2: number,
  player1Id: string,
  player2Id: string
): string | null {
  if (bet1 === bet2) return null; // tie
  if (HIGH_BET_FIRST) {
    return bet1 > bet2 ? player1Id : player2Id;
  }
  return bet1 < bet2 ? player1Id : player2Id;
}

/** Calculate base result: bet × received × used */
export function calculateResult(bet: number, receivedCard: number, usedCard: number): number {
  return bet * receivedCard * usedCard;
}

/** Get round score value */
export function getRoundScore(roundNumber: number): number {
  return ROUND_SCORES[roundNumber] ?? 1;
}

/** Check if sudden death is needed */
export function needsSuddenDeath(
  p1TotalScore: number,
  p2TotalScore: number,
  currentRound: number
): boolean {
  return currentRound === MAX_ROUNDS_NORMAL && p1TotalScore === p2TotalScore;
}

/** Full round resolution */
export function resolveRound(params: {
  roundNumber: number;
  mode: GameMode;
  p1Bet: number;
  p2Bet: number;
  p1GiveCard: number;
  p2GiveCard: number;
  p1UseCard: number;
  p2UseCard: number;
  player1Id: string;
  player2Id: string;
}): RoundResolution {
  const {
    roundNumber,
    p1Bet,
    p2Bet,
    p1GiveCard,
    p2GiveCard,
    p1UseCard,
    p2UseCard,
    player1Id,
    player2Id,
  } = params;

  // Player 1 receives p2GiveCard, Player 2 receives p1GiveCard
  const p1Received = p2GiveCard;
  const p2Received = p1GiveCard;

  let effectiveP1Bet = p1Bet;
  let effectiveP2Bet = p2Bet;
  let p1Bonus = 0;
  let p2Bonus = 0;
  let specialRule: RoundResolution["specialRule"] = null;

  // Check special rules (applied before result calculation)
  // Both use -1: bet doubles, +3 bonus each
  if (p1UseCard === -1 && p2UseCard === -1) {
    specialRule = "BOTH_NEGATIVE";
    effectiveP1Bet = p1Bet * BET_MULTIPLIER_BOTH_NEGATIVE;
    effectiveP2Bet = p2Bet * BET_MULTIPLIER_BOTH_NEGATIVE;
    p1Bonus = BOTH_NEGATIVE_BONUS;
    p2Bonus = BOTH_NEGATIVE_BONUS;
  }

  // Calculate results
  let p1Result: number;
  let p2Result: number;

  // Both use 0: treat used as 1, +1 bonus each
  if (p1UseCard === 0 && p2UseCard === 0) {
    specialRule = "BOTH_ZERO";
    const USED_OVERRIDE_VALUE = 1;
    p1Result = effectiveP1Bet * p1Received * USED_OVERRIDE_VALUE;
    p2Result = effectiveP2Bet * p2Received * USED_OVERRIDE_VALUE;
    p1Bonus = BOTH_ZERO_BONUS;
    p2Bonus = BOTH_ZERO_BONUS;
  } else {
    p1Result = calculateResult(effectiveP1Bet, p1Received, p1UseCard);
    p2Result = calculateResult(effectiveP2Bet, p2Received, p2UseCard);
  }

  // Determine winner
  let winnerId: string | null = null;
  if (p1Result > p2Result) {
    winnerId = player1Id;
  } else if (p2Result > p1Result) {
    winnerId = player2Id;
  }

  const roundScore = getRoundScore(roundNumber);

  // Score assignment
  let p1RoundScore = 0;
  let p2RoundScore = 0;
  let p1BetScore = 0;
  let p2BetScore = 0;

  if (winnerId === player1Id) {
    p1RoundScore = roundScore;
    p1BetScore = effectiveP1Bet;
  } else if (winnerId === player2Id) {
    p2RoundScore = roundScore;
    p2BetScore = effectiveP2Bet;
  }
  // Draw: both get 0

  return {
    player1Result: p1Result,
    player2Result: p2Result,
    winnerId,
    player1RoundScore: p1RoundScore,
    player2RoundScore: p2RoundScore,
    player1BetScore: p1BetScore,
    player2BetScore: p2BetScore,
    player1PredictionBonus: p1Bonus,
    player2PredictionBonus: p2Bonus,
    specialRule,
  };
}

/** Determine match winner after all rounds */
export function determineMatchWinner(
  p1Total: number,
  p2Total: number,
  player1Id: string,
  player2Id: string
): string | null {
  if (p1Total > p2Total) return player1Id;
  if (p2Total > p1Total) return player2Id;
  return null; // draw
}

/** Coin toss: returns the winning player id */
export function coinToss(player1Id: string, player2Id: string): string {
  return Math.random() < 0.5 ? player1Id : player2Id;
}
