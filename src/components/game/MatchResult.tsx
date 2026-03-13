"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { FilteredMatchState, PastRoundSummary } from "@/types";

interface MatchResultProps {
  match: FilteredMatchState;
  pastRounds: PastRoundSummary[];
}

function CardBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null) return null;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-gray-500">{label}</span>
      <span
        className={cn(
          "w-7 h-9 flex items-center justify-center rounded text-sm font-bold",
          value < 0 ? "bg-red-900/60 text-red-300" : "bg-gray-700 text-gray-200"
        )}
      >
        {value >= 0 ? `+${value}` : value}
      </span>
    </div>
  );
}

function RoundDetail({ r, myName, oppName }: { r: PastRoundSummary; myName: string; oppName: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg px-3 py-3 space-y-2">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-medium">R{r.roundNumber}</span>
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded",
            r.myOutcome === "WIN" && "bg-amber-400/20 text-amber-400",
            r.myOutcome === "LOSE" && "bg-red-400/20 text-red-400",
            r.myOutcome === "DRAW" && "bg-gray-400/20 text-gray-400"
          )}
        >
          {r.myOutcome}
        </span>
        <span className="text-gray-400 text-sm">
          +{r.myScoreBreakdown.total} / +{r.opponentScoreDelta}
        </span>
      </div>

      {/* Card details */}
      <div className="space-y-1.5">
        {/* My cards */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16 shrink-0 truncate">{myName}</span>
          <div className="flex gap-1.5">
            <CardBadge value={r.myBet} label="배팅" />
            <CardBadge value={r.myGiveCard} label="제시" />
            <CardBadge value={r.myUseCard} label="선택" />
            <CardBadge value={r.myResult} label="결과" />
          </div>
        </div>
        {/* Opponent cards */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16 shrink-0 truncate">{oppName}</span>
          <div className="flex gap-1.5">
            <CardBadge value={r.opponentBet} label="배팅" />
            <CardBadge value={r.opponentGiveCard} label="제시" />
            <CardBadge value={r.opponentUseCard} label="선택" />
            <CardBadge value={r.opponentResult} label="결과" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchResult({ match, pastRounds }: MatchResultProps) {
  const isWinner = match.winnerId !== null && match.myTotalScore > match.opponentTotalScore;
  const isLoser = match.winnerId !== null && match.myTotalScore < match.opponentTotalScore;
  const isDraw = match.winnerId === null;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div
        className={cn(
          "text-4xl font-black",
          isWinner && "text-amber-400",
          isLoser && "text-red-400",
          isDraw && "text-gray-400"
        )}
      >
        {isWinner && "VICTORY"}
        {isLoser && "DEFEAT"}
        {isDraw && "DRAW"}
      </div>

      {/* Final scores */}
      <div className="flex items-end gap-8">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">{match.myNickname}</div>
          <div className="text-4xl font-black text-amber-400">{match.myTotalScore}</div>
        </div>
        <div className="text-gray-600 text-2xl font-bold pb-1">:</div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">{match.opponentNickname}</div>
          <div className="text-4xl font-black text-blue-400">{match.opponentTotalScore}</div>
        </div>
      </div>

      {/* Round history with card details */}
      {pastRounds.length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          <h3 className="text-sm text-gray-500 text-center">라운드 기록</h3>
          {pastRounds.map((r) => (
            <RoundDetail
              key={r.roundNumber}
              r={r}
              myName={match.myNickname}
              oppName={match.opponentNickname}
            />
          ))}
        </div>
      )}

      <Button onClick={() => (window.location.href = "/")} variant="primary" size="lg">
        홈으로
      </Button>
    </div>
  );
}
