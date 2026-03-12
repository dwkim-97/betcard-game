"use client";

import { use } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { usePlayerId } from "@/hooks/usePlayerId";

export default function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const { playerId } = usePlayerId();

  if (!playerId) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return <GameBoard matchId={matchId} playerId={playerId} />;
}
