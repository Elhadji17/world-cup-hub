// src/hooks/useGameStats.js
// Context global GameStats — corrige React error #300

import { createContext, useContext, useState, useEffect, useCallback, useRef, createElement } from "react";

const API       = import.meta.env.VITE_API_URL ?? "";
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
  const [stats,   setStatsRaw] = useState(loadLocal);
  const [loading, setLoading]  = useState(false);
  const statsRef = useRef(stats);

  // Wrapper pour garder statsRef à jour sans causer de re-render
  function setStats(val) {
    const next = typeof val === "function" ? val(statsRef.current) : val;
    statsRef.current = next;
    saveLocal(next);
    setStatsRaw(next);
  }

  // Fetch depuis MongoDB
  const refresh = useCallback(async () => {
    const token = localStorage.getItem("wch_token");
    if (!token) return;
    try {
      const res  = await fetch(`${API}/api/quiz?action=stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.coins != null) {
        setStats({
          coins:         data.coins,
          lives:         data.lives,
          totalCoins:    data.totalCoins,
          lastLifeAt:    Date.now(),
          freeHintsLeft: data.freeHintsLeft ?? 0,
        });
      }
    } catch {}
  }, []);

  // Charger au montage
  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, []);

  // Soumettre résultat d'une partie
  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers, livesUsed }) => {
    const token = localStorage.getItem("wch_token");
    const coinsEarned = (correct * 10) +
      ((fastAnswers ?? 0) * 10) +
      (streak >= 10 ? 80 : streak >= 5 ? 30 : 0);

    // Mise à jour locale immédiate — utilise statsRef pour éviter #300
    const current = statsRef.current;
    setStats({
      ...current,
      coins:      current.coins + coinsEarned,
      totalCoins: current.totalCoins + coinsEarned,
      lives:      Math.max(0, current.lives - (livesUsed ?? 0)),
      lastLifeAt: (livesUsed ?? 0) > 0 ? Date.now() : current.lastLifeAt,
    });

    if (!token) return { coinsEarned };

    try {
      const res  = await fetch(`${API}/api/quiz?action=submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),
      });
      const data = await res.json();
      if (data.coins != null) {
        setStats(prev => ({ ...prev, coins: data.coins, lives: data.lives }));
        return { coinsEarned: data.coinsEarned ?? coinsEarned };
      }
    } catch {}
    return { coinsEarned };
  }, []);

  // Utiliser une vie
  const useLife = useCallback(() => {
    setStats(prev => ({
      ...prev,
      lives:      Math.max(0, prev.lives - 1),
      lastLifeAt: Date.now(),
    }));
  }, []);

  // Acheter au shop
  const buyItem = useCallback(async (item) => {
    const token = localStorage.getItem("wch_token");
    if (!token) return { success: false, error: "Connecte-toi pour acheter." };
    try {
      const res  = await fetch(`${API}/api/quiz?action=shop`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setStats(prev => ({ ...prev, coins: data.coins, lives: data.lives }));
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
  if (!ctx) throw new Error("useGameStats doit être dans GameStatsProvider");
  return ctx;
}
