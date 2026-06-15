// src/hooks/useGameStats.js
// Context global — partagé dans toute l'app via GameStatsProvider

import { createContext, useContext, useState, useEffect, useCallback, createElement } from "react";

const API       = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "wch_token";
const LOCAL_KEY = "wch_gamestats";

const MAX_LIVES     = 5;
const LIFE_REGEN_MS = 60 * 60 * 1000;

const DEFAULT_STATS = {
  coins: 0, lives: MAX_LIVES, totalCoins: 0,
  lastLifeAt: Date.now(), freeHintsLeft: 0,
};

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? DEFAULT_STATS; }
  catch { return DEFAULT_STATS; }
}

function saveLocal(s) { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); }

const GameStatsContext = createContext(null);

export function GameStatsProvider({ children }) {
  const [stats,   setStats]   = useState(loadLocal);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  // Fetch depuis MongoDB — source de vérité
  const refresh = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    try {
      const res  = await fetch(`${API}/api/quiz?action=stats`, {
        headers: { "Authorization": `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.coins != null) {
        const fresh = {
          coins:         data.coins,
          lives:         data.lives,
          totalCoins:    data.totalCoins,
          lastLifeAt:    Date.now(),
          freeHintsLeft: data.freeHintsLeft ?? 0,
        };
        setStats(fresh);
        saveLocal(fresh);
      }
    } catch {}
  }, []);

  // Charger au montage
  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, []);

  // Soumettre résultat
  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers, livesUsed }) => {
    const t = localStorage.getItem(TOKEN_KEY);
    const coinsEarned = (correct * 10) +
      ((fastAnswers ?? 0) * 10) +
      (streak >= 10 ? 80 : streak >= 5 ? 30 : 0);

    // Mise à jour locale immédiate
    setStats(prev => {
      const s = {
        ...prev,
        coins:      prev.coins + coinsEarned,
        totalCoins: prev.totalCoins + coinsEarned,
        lives:      Math.max(0, prev.lives - (livesUsed ?? 0)),
        lastLifeAt: livesUsed > 0 ? Date.now() : prev.lastLifeAt,
      };
      saveLocal(s);
      return s;
    });

    if (!t) return { coinsEarned };

    try {
      const res  = await fetch(`${API}/api/quiz?action=submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` },
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),
      });
      const data = await res.json();
      if (data.coins != null) {
        setStats(prev => {
          const s = { ...prev, coins: data.coins, lives: data.lives };
          saveLocal(s);
          return s;
        });
        return { coinsEarned: data.coinsEarned ?? coinsEarned };
      }
    } catch {}
    return { coinsEarned };
  }, []);

  // Utiliser une vie
  const useLife = useCallback(() => {
    setStats(prev => {
      if (prev.lives <= 0) return prev;
      const s = { ...prev, lives: prev.lives - 1, lastLifeAt: Date.now() };
      saveLocal(s);
      return s;
    });
  }, []);

  // Acheter au shop
  const buyItem = useCallback(async (item) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return { success: false, error: "Connecte-toi pour acheter." };
    try {
      const res  = await fetch(`${API}/api/quiz?action=shop`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` },
        body:    JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setStats(prev => {
        const s = { ...prev, coins: data.coins, lives: data.lives };
        saveLocal(s);
        return s;
      });
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const nextLifeIn = stats.lives >= MAX_LIVES
    ? null
    : Math.max(0, LIFE_REGEN_MS - (Date.now() - (stats.lastLifeAt ?? Date.now())));

  const value = {
    coins:         stats.coins,
    lives:         stats.lives,
    totalCoins:    stats.totalCoins,
    freeHintsLeft: stats.freeHintsLeft ?? 0,
    nextLifeIn,
    loading,
    maxLives:      MAX_LIVES,
    submitResult,
    useLife,
    buyItem,
    refresh,
  };

  return createElement(GameStatsContext.Provider, { value }, children);
}

export function useGameStats() {
  const ctx = useContext(GameStatsContext);
  if (!ctx) throw new Error("useGameStats doit être utilisé dans GameStatsProvider");
  return ctx;
}
