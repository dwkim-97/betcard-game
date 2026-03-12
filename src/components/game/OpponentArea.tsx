"use client";

import { cn } from "@/lib/utils";
import type { FilteredMatchState, FilteredRoundState, Phase } from "@/types";

interface OpponentAreaProps {
  match: FilteredMatchState;
  round: FilteredRoundState | null;
}

function getOpponentStatusText(round: FilteredRoundState, phase: Phase | null): string {
  if (!phase) return "";

  if (phase === "BET" || phase === "BET_REBID") {
    return round.opponentHasBet ? "베팅 완료" : "베팅 중...";
  }
  if (phase === "GIVE") {
    return round.opponentHasGiven ? "카드 선택 완료" : "카드 선택 중...";
  }
  if (phase === "USE") {
    return round.opponentHasUsed ? "카드 사용 완료" : "카드 선택 중...";
  }
  if (phase === "RESOLVE" || phase === "ROUND_END") {
    return "";
  }
  return "";
}

export function OpponentArea({ match, round }: OpponentAreaProps) {
  const status = round ? getOpponentStatusText(round, match.currentPhase) : "";
  const isReady =
    round &&
    ((match.currentPhase === "BET" && round.opponentHasBet) ||
      (match.currentPhase === "BET_REBID" && round.opponentHasBet) ||
      (match.currentPhase === "GIVE" && round.opponentHasGiven) ||
      (match.currentPhase === "USE" && round.opponentHasUsed));

  return (
    <div className="bg-gray-900/50 rounded-xl px-4 py-3 border border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {match.opponentNickname.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-300 font-medium">
            {match.opponentNickname}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                )}
              />
              <span className="text-xs text-gray-500">{status}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
