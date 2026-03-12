import { NORMAL_CARDS, SUDDEN_DEATH_CARDS } from "@/consts/cards";
import type { GameMode } from "@/types";

const DEFAULT_BET_NORMAL = 0;
const DEFAULT_BET_SUDDEN_DEATH = 0;

/** Auto-select for BET phase timeout */
export function autoPickBet(mode: GameMode): number {
  return mode === "SUDDEN_DEATH" ? DEFAULT_BET_SUDDEN_DEATH : DEFAULT_BET_NORMAL;
}

/** Auto-select for GIVE phase timeout: random card from available */
export function autoPickGiveCard(mode: GameMode): number {
  const cards = mode === "SUDDEN_DEATH" ? [...SUDDEN_DEATH_CARDS] : [...NORMAL_CARDS];
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

/** Auto-select for USE phase timeout: random card that isn't the give card */
export function autoPickUseCard(giveCard: number, mode: GameMode): number {
  const cards = mode === "SUDDEN_DEATH" ? [...SUDDEN_DEATH_CARDS] : [...NORMAL_CARDS];
  const remaining = cards.filter((c) => c !== giveCard);
  const index = Math.floor(Math.random() * remaining.length);
  return remaining[index];
}
