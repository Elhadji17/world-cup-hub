// src/hooks/useGameStats.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API           = import.meta.env.VITE_API_URL ?? "";
const LOCAL_KEY     = "wch_gamestats";
const MAX_LIVES     = 5;
const LIFE_REGEN_MS = 30 * 60 * 1000; // 30 min

const DEFAULT = {
  coins: 0, lives: MAX_LIVES, totalCoins: 0, totalPoints: 0,
  lastLifeAt: Date.now(), freeHintsLeft: 0,
};

function load()     { try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? DEFAULT; } catch { return DEFAULT; } }
function save(s)    { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); }
function getToken() { return localStorage.getItem("wch_token"); }

const Ctx = createContext(null);

export function GameStatsProvider({ children }) {
  const [stats, setStats] = useState(load);

  const safeSet = useCallback((fn) => {
    setTimeout(() => {
      setStats(prev => {
        const next = typeof fn === "function" ? fn(prev) : { ...prev, ...fn };
        save(next);
        return next;
      });
    }, 0);
  }, []);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${API}/api/quiz?action=stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.coins != null) {
        // Calculer lastLifeAt depuis nextLifeIn pour que le compte à rebours
        // soit cohérent entre les visites
        const lastLifeAt = data.nextLifeIn
          ? Date.now() - (LIFE_REGEN_MS - data.nextLifeIn)
          : Date.now();

        safeSet({
          coins:         data.coins,
          lives:         data.lives,
          totalCoins:    data.totalCoins,
          totalPoints:   data.totalPoints ?? 0,
          lastLifeAt,
          freeHintsLeft: data.freeHintsLeft ?? 0,
        });
      }
    } catch {}
  }, [safeSet]);

  useEffect(() => { refresh(); }, []);

  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers, livesUsed }) => {
    const token  = getToken();
    const earned = (correct * 10) + ((fastAnswers ?? 0) * 10) +
      (streak >= 10 ? 80 : streak >= 5 ? 30 : 0);

    safeSet(prev => ({
      ...prev,
      coins:      prev.coins + earned,
      totalCoins: prev.totalCoins + earned,
      
    }));

    if (!token) return { coinsEarned: earned };
    try {
      const res  = await fetch(`${API}/api/quiz?action=submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),
      });
      const data = await res.json();
      if (data.coins != null) {
        safeSet(prev => ({ ...prev, coins: data.coins, lives: data.lives }));
        return { coinsEarned: data.coinsEarned ?? earned };
      }
    } catch {}
    return { coinsEarned: earned };
  }, [safeSet]);

  const useLife = useCallback(() => {
    safeSet(prev => ({ ...prev, lives: Math.max(0, prev.lives - 1), lastLifeAt: Date.now() }));
  }, [safeSet]);

  const buyItem = useCallback(async (item) => {
    const token = getToken();
    if (!token) return { success: false, error: "Connecte-toi pour acheter." };
    try {
      const res  = await fetch(`${API}/api/quiz?action=shop`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      safeSet(prev => ({ ...prev, coins: data.coins, lives: data.lives }));
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [safeSet]);

  const nextLifeIn = stats.lives >= MAX_LIVES
    ? null
    : Math.max(0, LIFE_REGEN_MS - (Date.now() - (stats.lastLifeAt ?? Date.now())));

  return (
    <Ctx.Provider value={{
      coins: stats.coins, lives: stats.lives, totalCoins: stats.totalCoins,
      totalPoints: stats.totalPoints ?? 0, freeHintsLeft: stats.freeHintsLeft ?? 0,
      nextLifeIn, maxLives: MAX_LIVES, submitResult, useLife, buyItem, refresh,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGameStats() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGameStats doit être dans GameStatsProvider");
  return ctx;
}
