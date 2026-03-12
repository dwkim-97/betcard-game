"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface WaitingRoomProps {
  inviteCode: string;
}

export function WaitingRoom({ inviteCode }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <h2 className="text-xl font-bold text-gray-200">대기 중...</h2>
      <p className="text-sm text-gray-400">아래 코드를 상대에게 공유하세요</p>

      <div className="bg-gray-800 rounded-2xl px-8 py-4 border border-gray-700">
        <div className="text-3xl font-mono font-black tracking-[0.3em] text-amber-400">
          {inviteCode}
        </div>
      </div>

      <Button onClick={handleCopy} variant="secondary">
        {copied ? "복사됨!" : "코드 복사"}
      </Button>

      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        상대 접속 대기 중
      </div>
    </div>
  );
}
