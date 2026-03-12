"use client";

import { CardDisplay } from "./CardDisplay";
import type { GameMode } from "@/types";
import { NORMAL_CARDS, SUDDEN_DEATH_CARDS } from "@/consts/cards";

interface CardHandProps {
  mode: GameMode;
  selectedCard: number | null;
  onSelectCard: (card: number) => void;
  excludeCard?: number | null;
  disabled?: boolean;
}

export function CardHand({
  mode,
  selectedCard,
  onSelectCard,
  excludeCard,
  disabled = false,
}: CardHandProps) {
  const cards = mode === "SUDDEN_DEATH" ? [...SUDDEN_DEATH_CARDS] : [...NORMAL_CARDS];

  return (
    <div className="flex gap-3 justify-center">
      {cards.map((card) => (
        <CardDisplay
          key={card}
          value={card}
          selected={selectedCard === card}
          dimmed={excludeCard === card}
          disabled={disabled}
          size="lg"
          onClick={() => onSelectCard(card)}
        />
      ))}
    </div>
  );
}
