import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getCardColor } from "@/consts/cards";
import type {
  MatchRow,
  RoundRow,
  FilteredMatchState,
  FilteredRoundState,
  GameStateResponse,
  PastRoundSummary,
  ScoreBreakdown,
  Outcome,
  GameEvent,
  PlayerPrefix,
} from "@/types";

const MAX_COLOR_REVEAL_ROUND = 2;

function getPlayerPrefix(playerId: string, match: MatchRow): PlayerPrefix {
  return playerId === match.player1_id ? "player1" : "player2";
}

function getOpponentPrefix(playerId: string, match: MatchRow): PlayerPrefix {
  return playerId === match.player1_id ? "player2" : "player1";
}

function filterMatch(match: MatchRow, playerId: string): FilteredMatchState {
  const amIPlayer1 = playerId === match.player1_id;
  return {
    matchId: match.id,
    inviteCode: match.invite_code,
    status: match.status,
    currentRound: match.current_round,
    currentPhase: match.current_phase as FilteredMatchState["currentPhase"],
    phaseDeadline: match.phase_deadline,
    myNickname: amIPlayer1 ? match.player1_nickname : match.player2_nickname,
    opponentNickname: amIPlayer1 ? match.player2_nickname : match.player1_nickname,
    myTotalScore: amIPlayer1 ? match.player1_total_score : match.player2_total_score,
    opponentTotalScore: amIPlayer1 ? match.player2_total_score : match.player1_total_score,
    myPool: amIPlayer1 ? match.player1_pool : match.player2_pool,
    amIPlayer1,
    winnerId: match.winner_id,
  };
}

function filterRound(round: RoundRow, playerId: string, match: MatchRow): FilteredRoundState {
  const myPrefix = getPlayerPrefix(playerId, match);
  const oppPrefix = getOpponentPrefix(playerId, match);

  const myGiveCard = round[`${myPrefix}_give_card`] as number | null;
  const oppGiveCard = round[`${oppPrefix}_give_card`] as number | null;
  const myBet = round[`${myPrefix}_bet`] as number | null;

  // Received card info (opponent's give card is what I receive)
  let receivedCardColor = null;
  let receivedCardBlind = false;
  const hasReceivedCard = oppGiveCard !== null;

  if (hasReceivedCard) {
    if (round.round_number <= MAX_COLOR_REVEAL_ROUND && round.mode === "NORMAL") {
      receivedCardColor = getCardColor(oppGiveCard!);
    } else {
      receivedCardBlind = true;
    }
  }

  // Outcome (only if resolved)
  let myOutcome: Outcome | null = null;
  let myScoreBreakdown: ScoreBreakdown | null = null;
  let opponentScoreDelta: number | null = null;

  if (round.resolved) {
    const myRoundScore = round[`${myPrefix}_round_score`] as number;
    const myBetScore = round[`${myPrefix}_bet_score`] as number;
    const myBonus = round[`${myPrefix}_prediction_bonus`] as number;
    const oppRoundScore = round[`${oppPrefix}_round_score`] as number;
    const oppBetScore = round[`${oppPrefix}_bet_score`] as number;
    const oppBonus = round[`${oppPrefix}_prediction_bonus`] as number;

    const myTotal = myRoundScore + myBetScore + myBonus;
    const oppTotal = oppRoundScore + oppBetScore + oppBonus;

    if (myTotal > 0 && oppTotal === 0) {
      myOutcome = "WIN";
    } else if (myTotal === 0 && oppTotal > 0) {
      myOutcome = "LOSE";
    } else {
      myOutcome = "DRAW";
    }

    myScoreBreakdown = {
      roundScore: myRoundScore,
      betScore: myBetScore,
      bonusScore: myBonus,
      total: myTotal,
    };

    opponentScoreDelta = oppTotal;
  }

  // Build events
  const events: GameEvent[] = [];
  if (round.bet_tie_count > 0) {
    events.push({ type: "BET_TIE_REBID", message: "승점 동률로 재제시 진행" });
  }

  // Check first player
  let amIFirst: boolean | null = null;
  if (round.first_player_id) {
    amIFirst = round.first_player_id === playerId;
  }

  return {
    roundNumber: round.round_number,
    mode: round.mode as FilteredRoundState["mode"],
    myBet: myBet,
    myGiveCard: myGiveCard,
    myUseCard: round[`${myPrefix}_use_card`] as number | null,
    opponentHasBet: round[`${oppPrefix}_bet`] !== null,
    opponentHasGiven: oppGiveCard !== null,
    opponentHasUsed: round[`${oppPrefix}_use_card`] !== null,
    receivedCardColor,
    receivedCardBlind,
    hasReceivedCard,
    amIFirst,
    betTied: false, // set by caller if needed
    resolved: round.resolved,
    myOutcome,
    myScoreBreakdown,
    opponentScoreDelta,
    autoPickPhases: [],
    events,
  };
}

function buildPastRoundSummary(
  round: RoundRow,
  playerId: string,
  match: MatchRow
): PastRoundSummary {
  const myPrefix = getPlayerPrefix(playerId, match);
  const oppPrefix = getOpponentPrefix(playerId, match);

  const myRoundScore = (round[`${myPrefix}_round_score`] as number) ?? 0;
  const myBetScore = (round[`${myPrefix}_bet_score`] as number) ?? 0;
  const myBonus = (round[`${myPrefix}_prediction_bonus`] as number) ?? 0;
  const oppRoundScore = (round[`${oppPrefix}_round_score`] as number) ?? 0;
  const oppBetScore = (round[`${oppPrefix}_bet_score`] as number) ?? 0;
  const oppBonus = (round[`${oppPrefix}_prediction_bonus`] as number) ?? 0;

  const myTotal = myRoundScore + myBetScore + myBonus;
  const oppTotal = oppRoundScore + oppBetScore + oppBonus;

  let myOutcome: Outcome;
  if (myTotal > 0 && oppTotal === 0) {
    myOutcome = "WIN";
  } else if (myTotal === 0 && oppTotal > 0) {
    myOutcome = "LOSE";
  } else {
    myOutcome = "DRAW";
  }

  return {
    roundNumber: round.round_number,
    myOutcome,
    myScoreBreakdown: {
      roundScore: myRoundScore,
      betScore: myBetScore,
      bonusScore: myBonus,
      total: myTotal,
    },
    opponentScoreDelta: oppTotal,
    myBet: round[`${myPrefix}_bet`] as number | null,
    opponentBet: round[`${oppPrefix}_bet`] as number | null,
    myGiveCard: round[`${myPrefix}_give_card`] as number | null,
    opponentGiveCard: round[`${oppPrefix}_give_card`] as number | null,
    myUseCard: round[`${myPrefix}_use_card`] as number | null,
    opponentUseCard: round[`${oppPrefix}_use_card`] as number | null,
    myResult: round[`${myPrefix}_result`] as number | null,
    opponentResult: round[`${oppPrefix}_result`] as number | null,
  };
}

export async function GET(request: NextRequest) {
  const playerId = request.headers.get("x-player-id");
  if (!playerId) {
    return NextResponse.json({ success: false, error: "Missing player ID" }, { status: 401 });
  }

  const matchId = request.nextUrl.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ success: false, error: "Missing matchId" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
  }

  // Verify player is in match
  if (playerId !== match.player1_id && playerId !== match.player2_id) {
    return NextResponse.json({ success: false, error: "Not in this match" }, { status: 403 });
  }

  const filteredMatch = filterMatch(match, playerId);

  // Get all rounds
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*")
    .eq("match_id", matchId)
    .order("round_number", { ascending: true });

  const allRounds = rounds || [];

  // Current round
  const currentRound = allRounds.find((r) => r.round_number === match.current_round) || null;
  const filteredRound = currentRound ? filterRound(currentRound, playerId, match) : null;

  // Past rounds (resolved ones, excluding current)
  const pastRounds: PastRoundSummary[] = allRounds
    .filter((r) => r.resolved && r.round_number !== match.current_round)
    .map((r) => buildPastRoundSummary(r, playerId, match));

  const response: GameStateResponse = {
    match: filteredMatch,
    round: filteredRound,
    pastRounds,
  };

  return NextResponse.json(response);
}
