export const INITIAL_POOL = 5;
export const PHASE_TIMER_SEC = 20;
export const PHASE_TIMER_MS = 20_000;
export const POLLING_INTERVAL_MS = 3_000;
export const RESOLVE_DISPLAY_MS = 3_000;
export const INVITE_CODE_LENGTH = 6;
export const MAX_ROUNDS_NORMAL = 3;
export const SUDDEN_DEATH_ROUND = 4;

export const ROUND_SCORES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 1, // sudden death
};

export const BOTH_ZERO_BONUS = 1;
export const BOTH_NEGATIVE_BONUS = 3;
export const BET_TIE_MAX_REBIDS = 1;
export const BET_MULTIPLIER_BOTH_NEGATIVE = 2;

/** true = higher bet goes first */
export const HIGH_BET_FIRST = true;
