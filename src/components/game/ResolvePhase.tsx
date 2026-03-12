"use client";

import { cn } from "@/lib/utils";
import type { FilteredRoundState } from "@/types";

interface ResolvePhaseProps {
  round: FilteredRoundState;
}

export function ResolvePhase({ round }: ResolvePhaseProps) {
  if (!round.resolved || !round.myScoreBreakdown) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 animate-pulse">결과 계산 중...</div>
      </div>
    );
  }

  const { myOutcome, myScoreBreakdown, opponentScoreDelta } = round;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Outcome */}
      <div
        className={cn(
          "text-3xl font-black",
          myOutcome === "WIN" && "text-amber-400",
          myOutcome === "LOSE" && "text-red-400",
          myOutcome === "DRAW" && "text-gray-400"
        )}
      >
        {myOutcome === "WIN" && "승리!"}
        {myOutcome === "LOSE" && "패배"}
        {myOutcome === "DRAW" && "무승부"}
      </div>

      {/* Score breakdown */}
      <div className="bg-gray-800/80 rounded-xl p-4 w-full max-w-xs border border-gray-700">
        <h3 className="text-sm text-gray-400 mb-3 text-center">내 점수 분해</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">라운드 점수</span>
            <span className="text-gray-200 font-bold">
              +{myScoreBreakdown.roundScore}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">베팅 점수</span>
            <span className="text-gray-200 font-bold">
              +{myScoreBreakdown.betScore}
            </span>
          </div>
          {myScoreBreakdown.bonusScore > 0 && (
            <div className="flex justify-between">
              <span className="text-amber-400">예측 보너스</span>
              <span className="text-amber-400 font-bold">
                +{myScoreBreakdown.bonusScore}
              </span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-2 flex justify-between">
            <span className="text-gray-300 font-bold">합계</span>
            <span
              className={cn(
                "font-black text-lg",
                myScoreBreakdown.total > 0
                  ? "text-emerald-400"
                  : "text-gray-400"
              )}
            >
              +{myScoreBreakdown.total}
            </span>
          </div>
        </div>
      </div>

      {/* Opponent delta */}
      {opponentScoreDelta !== null && (
        <div className="text-sm text-gray-500">
          상대 점수 변화: <span className="text-blue-400">+{opponentScoreDelta}</span>
        </div>
      )}

      {/* Events */}
      {round.events.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          {round.events.map((event, i) => (
            <div key={i} className="bg-gray-800 px-3 py-1 rounded-lg">
              {event.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
