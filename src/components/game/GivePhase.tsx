"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardHand } from "./CardHand";
import type { FilteredRoundState } from "@/types";

interface GivePhaseProps {
  round: FilteredRoundState;
  onSubmitGive: (card: number) => Promise<unknown>;
  isSubmitting: boolean;
}

export function GivePhase({ round, onSubmitGive, isSubmitting }: GivePhaseProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const alreadySubmitted = round.myGiveCard !== null;

  const handleSubmit = async () => {
    if (selectedCard === null) return;
    await onSubmitGive(selectedCard);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-200">카드 주기</h2>
        <p className="text-sm text-gray-400 mt-1">
          상대에게 줄 카드 1장을 선택하세요
        </p>
      </div>

      {alreadySubmitted ? (
        <div className="text-center py-8">
          <div className="text-amber-400 font-bold text-xl mb-2">카드 선택 완료</div>
          <p className="text-gray-500 text-sm">상대를 기다리는 중...</p>
          {round.opponentHasGiven && (
            <p className="text-emerald-400 text-sm mt-1">상대도 선택 완료!</p>
          )}
        </div>
      ) : (
        <>
          <CardHand
            mode={round.mode}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
            disabled={isSubmitting}
          />

          <Button
            onClick={handleSubmit}
            disabled={selectedCard === null || isSubmitting}
            size="lg"
            className="w-full max-w-xs"
          >
            {isSubmitting ? "제출 중..." : "카드 주기 확정"}
          </Button>
        </>
      )}
    </div>
  );
}
