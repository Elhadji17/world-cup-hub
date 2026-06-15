// src/hooks/useGameStats.jsx
// Context global GameStats

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API       = import.meta.env.VITE_API_URL ?? "";
const LOCAL_KEY = "wch_gamestats";
const MAX_LIVES     = 5;
const LIFE_REGEN_MS = 60 * 60 * 1000;

const DEFAULT = { coins: 0, lives: MAX_LIVES, totalCoins: 0, lastLifeAt: Date.now(), freeHintsLeft: 0 };

function load()     { try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? DEFAULT; } catch { return DEFAULT; } }
function save(s)    { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); }
function getToken() { return localStorage.getItem("wch_token"); }

const Ctx = createContext(null);

export function GameStatsProvider({ children }) {
  const [stats, setStats] = useState(load);

  const update = useCallback((patch) => {
    setStats(prev => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  // Fetch MongoDB au montage
  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${API}/api/quiz?action=stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.coins != null) {
        update({
          coins:         data.coins,
          lives:         data.lives,
          totalCoins:    data.totalCoins,
          lastLifeAt:    Date.now(),
          freeHintsLeft: data.freeHintsLeft ?? 0,
        });
      }
    } catch {}
  }, [update]);

  useEffect(() => { refresh(); }, []);

  // Soumettre résultat
  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers, livesUsed }) => {
    const token = getToken();
    const earned = (correct * 10) +
      ((fastAnswers ?? 0) * 10) +
      (streak >= 10 ? 80 : streak >= 5 ? 30 : 0);

    // Mise à jour locale
    update(prev => ({
      ...prev,
      coins:      prev.coins + earned,
      totalCoins: prev.totalCoins + earned,
      lives:      Math.max(0, prev.lives - (livesUsed ?? 0)),
      lastLifeAt: (livesUsed ?? 0) > 0 ? Date.now() : prev.lastLifeAt,
    }));

    if (!token) return { coinsEarned: earned };

    // Sync backend
    try {
      const res  = await fetch(`${API}/api/quiz?action=submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),
      });
      const data = await res.json();
      if (data.coins != null) {
        update(prev => ({ ...prev, coins: data.coins, lives: data.lives }));
        return { coinsEarned: data.coinsEarned ?? earned };
      }
    } catch {}
    return { coinsEarned: earned };
  }, [update]);

  // Utiliser une vie
  const useLife = useCallback(() => {
    update(prev => ({ ...prev, lives: Math.max(0, prev.lives - 1), lastLifeAt: Date.now() }));
  }, [update]);

  // Acheter au shop
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
      update(prev => ({ ...prev, coins: data.coins, lives: data.lives }));
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [update]);

  const nextLifeIn = stats.lives >= MAX_LIVES
    ? null
    : Math.max(0, LIFE_REGEN_MS - (Date.now() - (stats.lastLifeAt ?? Date.now())));

  return (
    <Ctx.Provider value={{
      coins:         stats.coins,
      lives:         stats.lives,
      totalCoins:    stats.totalCoins,
      freeHintsLeft: stats.freeHintsLeft ?? 0,
      nextLifeIn,
      maxLives:      MAX_LIVES,
      submitResult,
      useLife,
      buyItem,
      refresh,
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
