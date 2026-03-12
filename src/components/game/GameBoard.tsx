"use client";

import { useCallback } from "react";
import { ScoreBoard } from "./ScoreBoard";
import { PhaseTimer } from "./PhaseTimer";
import { OpponentArea } from "./OpponentArea";
import { BetPhase } from "./BetPhase";
import { GivePhase } from "./GivePhase";
import { UsePhase } from "./UsePhase";
import { ResolvePhase } from "./ResolvePhase";
import { WaitingRoom } from "./WaitingRoom";
import { MatchResult } from "./MatchResult";
import { useMatch } from "@/hooks/useMatch";
import { usePhaseTimer } from "@/hooks/usePhaseTimer";
import { useGameActions } from "@/hooks/useGameActions";

interface GameBoardProps {
  matchId: string;
  playerId: string;
}

export function GameBoard({ matchId, playerId }: GameBoardProps) {
  const { gameState, loading, error } = useMatch(matchId, playerId);
  const { submitBet, submitGiveCard, submitUseCard, handleTimeout, isSubmitting } =
    useGameActions(matchId, playerId);

  const onTimerExpired = useCallback(() => {
    handleTimeout();
  }, [handleTimeout]);

  const { remainingSec, progress } = usePhaseTimer(
    gameState?.match?.phaseDeadline ?? null,
    onTimerExpired
  );

  if (loading || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 animate-pulse">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-red-400">오류: {error}</div>
      </div>
    );
  }

  const { match, round, pastRounds } = gameState;

  // Waiting for opponent
  if (match.status === "WAITING") {
    return <WaitingRoom inviteCode={match.inviteCode} />;
  }

  // Match finished
  if (match.status === "FINISHED") {
    return <MatchResult match={match} pastRounds={pastRounds} />;
  }

  // Game in progress
  const phase = match.currentPhase;

  return (
    <div className="flex flex-col gap-3 pb-4">
      <ScoreBoard match={match} />

      {phase && phase !== "ROUND_END" && (
        <PhaseTimer remainingSec={remainingSec} progress={progress} />
      )}

      <OpponentArea match={match} round={round} />

      <div className="flex-1 flex flex-col justify-center min-h-[300px] py-2">
        {(phase === "BET" || phase === "BET_REBID") && round && (
          <BetPhase
            match={match}
            round={round}
            onSubmitBet={submitBet}
            isSubmitting={isSubmitting}
          />
        )}

        {phase === "GIVE" && round && (
          <GivePhase
            round={round}
            onSubmitGive={submitGiveCard}
            isSubmitting={isSubmitting}
          />
        )}

        {phase === "USE" && round && (
          <UsePhase
            round={round}
            onSubmitUse={submitUseCard}
            isSubmitting={isSubmitting}
          />
        )}

        {(phase === "RESOLVE" || phase === "ROUND_END") && round && (
          <ResolvePhase round={round} />
        )}
      </div>
    </div>
  );
}
