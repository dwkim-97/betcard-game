import type {
  CreateMatchResponse,
  JoinMatchResponse,
  GameStateResponse,
  ApiResponse,
} from "@/types";

function getHeaders(playerId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-player-id": playerId,
  };
}

export async function createMatch(
  playerId: string,
  nickname: string
): Promise<CreateMatchResponse> {
  const res = await fetch("/api/match/create", {
    method: "POST",
    headers: getHeaders(playerId),
    body: JSON.stringify({ nickname }),
  });
  return res.json();
}

export async function joinMatch(
  playerId: string,
  inviteCode: string,
  nickname: string
): Promise<JoinMatchResponse & { success: boolean; error?: string }> {
  const res = await fetch("/api/match/join", {
    method: "POST",
    headers: getHeaders(playerId),
    body: JSON.stringify({ inviteCode, nickname }),
  });
  return res.json();
}

export async function fetchGameState(
  playerId: string,
  matchId: string
): Promise<GameStateResponse> {
  const res = await fetch(`/api/match/state?matchId=${matchId}`, {
    headers: getHeaders(playerId),
  });
  return res.json();
}

export async function submitBet(
  playerId: string,
  matchId: string,
  bet: number
): Promise<ApiResponse> {
  const res = await fetch("/api/match/bet", {
    method: "POST",
    headers: getHeaders(playerId),
    body: JSON.stringify({ matchId, bet }),
  });
  return res.json();
}

export async function submitGiveCard(
  playerId: string,
  matchId: string,
  card: number
): Promise<ApiResponse> {
  const res = await fetch("/api/match/give", {
    method: "POST",
    headers: getHeaders(playerId),
    body: JSON.stringify({ matchId, card }),
  });
  return res.json();
}

export async function submitUseCard(
  playerId: string,
  matchId: string,
  card: number
): Promise<ApiResponse> {
  const res = await fetch("/api/match/use", {
    method: "POST",
    headers: getHeaders(playerId),
    body: JSON.stringify({ matchId, card }),
  });
  return res.json();
}

export async function triggerTimeout(
  playerId: string,
  matchId: string
): Promise<ApiResponse> {
  const res = await fetch("/api/match/timeout", {
    method: "POST",
    headers: getHeaders(playerId),
    body: JSON.stringify({ matchId }),
  });
  return res.json();
}
