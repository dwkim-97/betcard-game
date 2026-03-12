import type { CardColor } from "@/consts/cards";

// ---- Database row types ----

export type MatchStatus = "WAITING" | "PLAYING" | "FINISHED";
export type Phase = "BET" | "BET_REBID" | "GIVE" | "USE" | "RESOLVE" | "ROUND_END";
export type GameMode = "NORMAL" | "SUDDEN_DEATH";
export type Outcome = "WIN" | "LOSE" | "DRAW";

export interface MatchRow {
  id: string;
  invite_code: string;
  status: MatchStatus;
  current_round: number;
  current_phase: Phase | null;
  phase_deadline: string | null;
  player1_id: string;
  player2_id: string | null;
  player1_nickname: string;
  player2_nickname: string;
  player1_total_score: number;
  player2_total_score: number;
  player1_pool: number;
  player2_pool: number;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoundRow {
  id: string;
  match_id: string;
  round_number: number;
  mode: GameMode;
  player1_bet: number | null;
  player2_bet: number | null;
  bet_tie_count: number;
  first_player_id: string | null;
  player1_give_card: number | null;
  player2_give_card: number | null;
  player1_use_card: number | null;
  player2_use_card: number | null;
  player1_result: number | null;
  player2_result: number | null;
  player1_round_score: number | null;
  player2_round_score: number | null;
  player1_bet_score: number | null;
  player2_bet_score: number | null;
  player1_prediction_bonus: number;
  player2_prediction_bonus: number;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Filtered state sent to client ----

export interface FilteredMatchState {
  matchId: string;
  inviteCode: string;
  status: MatchStatus;
  currentRound: number;
  currentPhase: Phase | null;
  phaseDeadline: string | null;
  myNickname: string;
  opponentNickname: string;
  myTotalScore: number;
  opponentTotalScore: number;
  myPool: number;
  amIPlayer1: boolean;
  winnerId: string | null;
}

export interface FilteredRoundState {
  roundNumber: number;
  mode: GameMode;
  // My submitted data
  myBet: number | null;
  myGiveCard: number | null;
  myUseCard: number | null;
  // Opponent status (boolean only - never values)
  opponentHasBet: boolean;
  opponentHasGiven: boolean;
  opponentHasUsed: boolean;
  // Received card info (what opponent gave me)
  receivedCardColor: CardColor | null; // R1-R2 only, null for R3/SD or not yet given
  receivedCardBlind: boolean; // true in R3/SD
  hasReceivedCard: boolean;
  // First player info
  amIFirst: boolean | null;
  // Bet rebid state
  betTied: boolean;
  // Resolved results (only after resolution)
  resolved: boolean;
  myOutcome: Outcome | null;
  myScoreBreakdown: ScoreBreakdown | null;
  opponentScoreDelta: number | null;
  // Auto-pick notices
  autoPickPhases: Phase[];
  // Events
  events: GameEvent[];
}

export interface ScoreBreakdown {
  roundScore: number;
  betScore: number;
  bonusScore: number;
  total: number;
}

export interface GameEvent {
  type: "BET_TIE_REBID" | "COIN_TOSS" | "AUTO_PICK" | "SPECIAL_BOTH_ZERO" | "SPECIAL_BOTH_NEGATIVE";
  message: string;
}

// ---- API request/response types ----

export interface CreateMatchRequest {
  nickname: string;
}

export interface CreateMatchResponse {
  matchId: string;
  inviteCode: string;
  playerId: string;
}

export interface JoinMatchRequest {
  inviteCode: string;
  nickname: string;
}

export interface JoinMatchResponse {
  matchId: string;
  playerId: string;
}

export interface GameStateResponse {
  match: FilteredMatchState;
  round: FilteredRoundState | null;
  pastRounds: PastRoundSummary[];
}

export interface PastRoundSummary {
  roundNumber: number;
  myOutcome: Outcome;
  myScoreBreakdown: ScoreBreakdown;
  opponentScoreDelta: number;
}

export interface SubmitBetRequest {
  matchId: string;
  bet: number;
}

export interface SubmitCardRequest {
  matchId: string;
  card: number;
}

export interface TimeoutRequest {
  matchId: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  betTied?: boolean;
  phaseAdvanced?: boolean;
}

// ---- Game engine types ----

export interface RoundResolution {
  player1Result: number;
  player2Result: number;
  winnerId: string | null;
  player1RoundScore: number;
  player2RoundScore: number;
  player1BetScore: number;
  player2BetScore: number;
  player1PredictionBonus: number;
  player2PredictionBonus: number;
  specialRule: "BOTH_ZERO" | "BOTH_NEGATIVE" | null;
}

export type PlayerPrefix = "player1" | "player2";
