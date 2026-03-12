"use client";

import { cn } from "@/lib/utils";
import type { FilteredMatchState } from "@/types";

interface ScoreBoardProps {
  match: FilteredMatchState;
}

const ROUND_LABELS: Record<number, string> = {
  1: "R1",
  2: "R2",
  3: "R3",
  4: "SD",
};

export function ScoreBoard({ match }: ScoreBoardProps) {
  return (
    <div className="bg-gray-900/80 rounded-2xl px-4 py-3 border border-gray-800">
      {/* Round indicators */}
      <div className="flex justify-center gap-2 mb-3">
        {[1, 2, 3].map((r) => (
          <div
            key={r}
            className={cn(
              "w-10 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
              match.currentRound === r
                ? "bg-amber-500 text-gray-900"
                : match.currentRound > r
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-800 text-gray-600"
            )}
          >
            {ROUND_LABELS[r]}
          </div>
        ))}
        {match.currentRound === 4 && (
          <div className="w-10 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-red-600 text-white animate-pulse">
            SD
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-xs text-gray-500 mb-1 truncate">{match.myNickname}</div>
          <div className="text-2xl font-bold text-amber-400">{match.myTotalScore}</div>
          <div className="text-xs text-gray-500">Pool: {match.myPool}</div>
        </div>

        <div className="text-gray-600 font-bold text-lg px-3">VS</div>

        <div className="text-center flex-1">
          <div className="text-xs text-gray-500 mb-1 truncate">{match.opponentNickname}</div>
          <div className="text-2xl font-bold text-blue-400">{match.opponentTotalScore}</div>
        </div>
      </div>
    </div>
  );
}
