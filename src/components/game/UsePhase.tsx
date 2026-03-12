"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardHand } from "./CardHand";
import { CardDisplay } from "./CardDisplay";
import type { FilteredRoundState } from "@/types";

interface UsePhaseProps {
  round: FilteredRoundState;
  onSubmitUse: (card: number) => Promise<unknown>;
  isSubmitting: boolean;
}

export function UsePhase({ round, onSubmitUse, isSubmitting }: UsePhaseProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const alreadySubmitted = round.myUseCard !== null;

  const handleSubmit = async () => {
    if (selectedCard === null) return;
    await onSubmitUse(selectedCard);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-200">카드 사용</h2>
        <p className="text-sm text-gray-400 mt-1">사용할 카드 1장을 선택하세요</p>
      </div>

      {/* Received card info */}
      {round.hasReceivedCard && (
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">상대가 준 카드</p>
          {round.receivedCardBlind ? (
            <CardDisplay hidden size="md" />
          ) : (
            <CardDisplay color={round.receivedCardColor} size="md" />
          )}
        </div>
      )}

      {alreadySubmitted ? (
        <div className="text-center py-4">
          <div className="text-amber-400 font-bold text-xl mb-2">카드 사용 완료</div>
          <p className="text-gray-500 text-sm">상대를 기다리는 중...</p>
          {round.opponentHasUsed && (
            <p className="text-emerald-400 text-sm mt-1">상대도 선택 완료!</p>
          )}
        </div>
      ) : (
        <>
          <CardHand
            mode={round.mode}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
            excludeCard={round.myGiveCard}
            disabled={isSubmitting}
          />

          <Button
            onClick={handleSubmit}
            disabled={selectedCard === null || isSubmitting}
            size="lg"
            className="w-full max-w-xs"
          >
            {isSubmitting ? "제출 중..." : "카드 사용 확정"}
          </Button>
        </>
      )}
    </div>
  );
}
