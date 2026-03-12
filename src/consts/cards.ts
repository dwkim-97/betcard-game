export const NORMAL_CARDS = [-1, 0, 1, 2] as const;
export const SUDDEN_DEATH_CARDS = [-1, 1, 2] as const;
export const SUDDEN_DEATH_BETS = [-1, 0, 1] as const;
export const BLACK_CARDS = new Set([-1, 2]);
export const WHITE_CARDS = new Set([0, 1]);

export type CardValue = -1 | 0 | 1 | 2;
export type CardColor = "BLACK" | "WHITE";

export function getCardColor(card: number): CardColor {
  return BLACK_CARDS.has(card) ? "BLACK" : "WHITE";
}
