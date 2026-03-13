"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HowToPlay } from "@/components/game/HowToPlay";
import { usePlayerId } from "@/hooks/usePlayerId";
import { createMatch, joinMatch } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { playerId, nickname, setNickname } = usePlayerId();
  const [inviteCode, setInviteCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  // Wait for playerId to load from localStorage
  if (!playerId) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const displayNickname = nicknameInput || nickname;

  const handleCreate = async () => {
    if (!displayNickname.trim()) {
      setError("닉네임을 입력하세요");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      setNickname(displayNickname.trim());
      const result = await createMatch(playerId, displayNickname.trim());
      if (result.matchId) {
        router.push(`/match/${result.matchId}`);
      }
    } catch {
      setError("방 생성에 실패했습니다");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!displayNickname.trim()) {
      setError("닉네임을 입력하세요");
      return;
    }
    if (!inviteCode.trim()) {
      setError("초대 코드를 입력하세요");
      return;
    }
    setIsJoining(true);
    setError(null);
    try {
      setNickname(displayNickname.trim());
      const result = await joinMatch(playerId, inviteCode.trim(), displayNickname.trim());
      if (result.success && result.matchId) {
        router.push(`/match/${result.matchId}`);
      } else {
        setError(result.error || "참가에 실패했습니다");
      }
    } catch {
      setError("참가에 실패했습니다");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-amber-400 tracking-tight">
          BetCard
        </h1>
        <p className="text-sm text-gray-500 mt-2">1:1 베팅 심리전 카드 게임</p>
      </div>

      {/* Nickname */}
      <div className="w-full max-w-xs">
        <label className="text-xs text-gray-500 mb-1 block">닉네임</label>
        <Input
          value={nicknameInput || nickname}
          onChange={(e) => setNicknameInput(e.target.value)}
          placeholder="닉네임 입력"
          maxLength={12}
          className="tracking-normal"
        />
      </div>

      {/* Create Game */}
      <Button
        onClick={handleCreate}
        disabled={isCreating || isJoining}
        size="lg"
        className="w-full max-w-xs"
      >
        {isCreating ? "생성 중..." : "새 게임 만들기"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600">또는</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Join Game */}
      <div className="w-full max-w-xs space-y-3">
        <Input
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="초대 코드 입력"
          maxLength={6}
        />
        <Button
          onClick={handleJoin}
          disabled={isCreating || isJoining || !inviteCode.trim()}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          {isJoining ? "참가 중..." : "게임 참가"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm bg-red-950/50 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* How to play */}
      <button
        onClick={() => setShowGuide(true)}
        className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 transition-colors"
      >
        플레이 방법
      </button>
      {showGuide && <HowToPlay onClose={() => setShowGuide(false)} />}
    </div>
  );
}
