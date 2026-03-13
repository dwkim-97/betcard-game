"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "게임 개요",
    content: (
      <>
        <p>1:1 심리전 카드 게임입니다.</p>
        <p>총 <strong className="text-amber-400">3라운드</strong>를 진행하며, 동점 시 <strong className="text-amber-400">서든데스</strong>가 진행됩니다.</p>
        <div className="bg-gray-800 rounded-lg p-3 mt-2 text-sm space-y-1">
          <div>R1 승리 = <span className="text-amber-400">1점</span></div>
          <div>R2 승리 = <span className="text-amber-400">2점</span></div>
          <div>R3 승리 = <span className="text-amber-400">3점</span></div>
          <div>서든데스 승리 = <span className="text-amber-400">1점</span></div>
        </div>
      </>
    ),
  },
  {
    title: "카드 구성",
    content: (
      <>
        <p>각 라운드마다 4장의 카드를 받습니다.</p>
        <div className="flex justify-center gap-2 my-3">
          {[
            { v: -1, color: "bg-red-900/60 text-red-300" },
            { v: 0, color: "bg-gray-700 text-gray-300" },
            { v: 1, color: "bg-gray-700 text-gray-300" },
            { v: 2, color: "bg-red-900/60 text-red-300" },
          ].map((c) => (
            <div key={c.v} className={cn("w-12 h-16 rounded-lg flex items-center justify-center text-lg font-bold", c.color)}>
              {c.v >= 0 ? `+${c.v}` : c.v}
            </div>
          ))}
        </div>
        <div className="text-sm space-y-1">
          <div><span className="text-red-400">BLACK</span> 카드: -1, +2</div>
          <div><span className="text-gray-300">WHITE</span> 카드: 0, +1</div>
        </div>
      </>
    ),
  },
  {
    title: "라운드 진행",
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
          <div>
            <strong>배팅</strong>
            <p className="text-gray-400 text-sm">보유 포인트에서 배팅할 양을 선택합니다. (시작 포인트: 5)</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
          <div>
            <strong>카드 제시</strong>
            <p className="text-gray-400 text-sm">상대에게 줄 카드 1장을 선택합니다.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
          <div>
            <strong>카드 선택</strong>
            <p className="text-gray-400 text-sm">남은 3장 중 사용할 카드 1장을 선택합니다.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
          <div>
            <strong>결과 계산</strong>
            <p className="text-gray-400 text-sm">결과값이 높은 쪽이 승리!</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "점수 계산",
    content: (
      <>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400 mb-1">결과값 공식</div>
          <div className="text-lg font-bold text-amber-400">배팅 x 받은 카드 x 선택 카드</div>
        </div>
        <div className="mt-3 text-sm space-y-2">
          <p>라운드 승리 시 획득:</p>
          <ul className="space-y-1 text-gray-400 ml-3">
            <li>• <span className="text-gray-200">라운드 점수</span> (R1=1, R2=2, R3=3)</li>
            <li>• <span className="text-gray-200">배팅 점수</span> (배팅한 만큼 추가 획득)</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: "정보 공개 규칙",
    content: (
      <div className="space-y-3 text-sm">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="font-bold mb-1">R1, R2</div>
          <p className="text-gray-400">상대가 제시한 카드의 <span className="text-amber-400">색상</span>만 공개됩니다.</p>
          <p className="text-gray-500 text-xs mt-1">BLACK(-1 또는 +2) / WHITE(0 또는 +1)</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="font-bold mb-1">R3, 서든데스</div>
          <p className="text-gray-400">받은 카드가 <span className="text-red-400">완전 비공개</span>입니다.</p>
        </div>
        <p className="text-gray-500">상대의 배팅, 카드 값, 결과값은 게임 종료 전까지 공개되지 않습니다.</p>
      </div>
    ),
  },
  {
    title: "특수 규칙",
    content: (
      <div className="space-y-3 text-sm">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="font-bold mb-1">둘 다 0 선택</div>
          <p className="text-gray-400">선택 카드를 <span className="text-amber-400">+1로 취급</span>하고, 양쪽 모두 <span className="text-amber-400">+1 보너스</span></p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="font-bold mb-1">둘 다 -1 선택</div>
          <p className="text-gray-400">배팅이 <span className="text-red-400">2배</span>로 적용되고, 양쪽 모두 <span className="text-amber-400">+3 보너스</span></p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="font-bold mb-1">배팅 동률</div>
          <p className="text-gray-400">배팅이 같으면 <span className="text-amber-400">1회 재배팅</span>, 또 같으면 코인 토스로 선공 결정</p>
        </div>
      </div>
    ),
  },
];

export function HowToPlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="font-bold text-lg">플레이 방법</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none px-1">
            &times;
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-4 pt-3">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i === step ? "bg-amber-400" : "bg-gray-700"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h3 className="text-amber-400 font-bold text-lg mb-3">{current.title}</h3>
          <div className="text-gray-200 text-sm leading-relaxed space-y-2">
            {current.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 px-4 py-3 border-t border-gray-800">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 rounded-lg bg-gray-800 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-colors"
            >
              이전
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              다음
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
