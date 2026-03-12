"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FilteredMatchState, FilteredRoundState } from "@/types";
import { SUDDEN_DEATH_BETS } from "@/consts/cards";

interface BetPhaseProps {
  match: FilteredMatchState;
  round: FilteredRoundState;
  onSubmitBet: (bet: number) => Promise<unknown>;
  isSubmitting: boolean;
}

export function BetPhase({ match, round, onSubmitBet, isSubmitting }: BetPhaseProps) {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const alreadySubmitted = round.myBet !== null;

  const isSuddenDeath = round.mode === "SUDDEN_DEATH";
  const betOptions = isSuddenDeath
    ? [...SUDDEN_DEATH_BETS]
    : Array.from({ length: match.myPool + 1 }, (_, i) => i);

  const handleSubmit = async () => {
    if (selectedBet === null) return;
    await onSubmitBet(selectedBet);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-200">
          {round.betTied ? "동률! 다시 베팅하세요" : "베팅"}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {isSuddenDeath
            ? "서든데스: -1, 0, 1 중 선택"
            : `사용 가능: ${match.myPool}점`}
        </p>
      </div>

      {alreadySubmitted ? (
        <div className="text-center py-8">
          <div className="text-amber-400 font-bold text-xl mb-2">
            {round.myBet}점 베팅 완료
          </div>
          <p className="text-gray-500 text-sm">상대를 기다리는 중...</p>
          {round.opponentHasBet && (
            <p className="text-emerald-400 text-sm mt-1">상대도 베팅 완료!</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {betOptions.map((bet) => (
              <button
                key={bet}
                onClick={() => setSelectedBet(bet)}
                disabled={isSubmitting}
                className={cn(
                  "w-14 h-14 rounded-xl font-bold text-lg transition-all",
                  "border-2 active:scale-95",
                  selectedBet === bet
                    ? "bg-amber-500 border-amber-400 text-gray-900 scale-105"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                )}
              >
                {bet}
              </button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedBet === null || isSubmitting}
            size="lg"
            className="w-full max-w-xs"
          >
            {isSubmitting ? "제출 중..." : "베팅 확정"}
          </Button>
        </>
      )}
    </div>
  );
}
