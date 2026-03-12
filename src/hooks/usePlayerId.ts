"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

const PLAYER_ID_KEY = "betcard_player_id";
const NICKNAME_KEY = "betcard_nickname";

export function usePlayerId() {
  const [playerId, setPlayerId] = useState<string>("");
  const [nickname, setNicknameState] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    setPlayerId(id);

    const name = localStorage.getItem(NICKNAME_KEY) || "";
    setNicknameState(name);
  }, []);

  const setNickname = useCallback((name: string) => {
    setNicknameState(name);
    localStorage.setItem(NICKNAME_KEY, name);
  }, []);

  return { playerId, nickname, setNickname };
}
