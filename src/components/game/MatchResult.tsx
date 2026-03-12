"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { FilteredMatchState, PastRoundSummary } from "@/types";

interface MatchResultProps {
  match: FilteredMatchState;
  pastRounds: PastRoundSummary[];
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

      {/* Round history */}
      {pastRounds.length > 0 && (
        <div className="w-full max-w-xs space-y-2">
          <h3 className="text-sm text-gray-500 text-center">라운드 기록</h3>
          {pastRounds.map((r) => (
            <div
              key={r.roundNumber}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-gray-400">
                R{r.roundNumber}
              </span>
              <span
                className={cn(
                  "font-bold",
                  r.myOutcome === "WIN" && "text-amber-400",
                  r.myOutcome === "LOSE" && "text-red-400",
                  r.myOutcome === "DRAW" && "text-gray-400"
                )}
              >
                {r.myOutcome === "WIN" ? "WIN" : r.myOutcome === "LOSE" ? "LOSE" : "DRAW"}
              </span>
              <span className="text-gray-400">
                +{r.myScoreBreakdown.total}
              </span>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => (window.location.href = "/")} variant="primary" size="lg">
        홈으로
      </Button>
    </div>
  );
}
