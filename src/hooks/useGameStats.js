// src/hooks/useGameStats.js
// Gestion coins + vies — sync MongoDB si connecté, localStorage sinon

import { useState, useEffect, useCallback } from "react";

const API        = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY  = "wch_token";
const LOCAL_KEY  = "wch_gamestats";

const MAX_LIVES      = 5;
const LIFE_REGEN_MS  = 60 * 60 * 1000; // 1h

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? {
      coins: 100, lives: MAX_LIVES, totalCoins: 100,
      lastLifeAt: Date.now(), freeHintsLeft: 0,
    };
  } catch { return { coins: 100, lives: MAX_LIVES, totalCoins: 100, lastLifeAt: Date.now(), freeHintsLeft: 0 }; }
}

function saveLocal(stats) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(stats));
}

function regenLivesLocal(stats) {
  if (stats.lives >= MAX_LIVES) return stats;
  const elapsed  = Date.now() - stats.lastLifeAt;
  const regenned = Math.floor(elapsed / LIFE_REGEN_MS);
  if (regenned <= 0) return stats;
  const newLives   = Math.min(stats.lives + regenned, MAX_LIVES);
  const newLastLife = stats.lastLifeAt + regenned * LIFE_REGEN_MS;
  return { ...stats, lives: newLives, lastLifeAt: newLastLife };
}

export function useGameStats() {
  const [stats,   setStats]   = useState(() => regenLivesLocal(loadLocal()));
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem(TOKEN_KEY);

  // Charger depuis le backend si connecté
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/quiz/stats`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.coins != null) {
          const s = { ...stats, ...data, lastLifeAt: Date.now() };
          setStats(s);
          saveLocal(s);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Temps avant prochaine vie
  const nextLifeIn = stats.lives >= MAX_LIVES
    ? null
    : Math.max(0, LIFE_REGEN_MS - (Date.now() - stats.lastLifeAt));

  // Soumettre résultat d'une partie
  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers, livesUsed }) => {
    // Calcul local immédiat
    const coinsEarned = correct * 10 + (fastAnswers ?? 0) * 10 +
      (streak >= 10 ? 80 : streak >= 5 ? 30 : 0);

    const newStats = {
      ...stats,
      coins:      stats.coins + coinsEarned,
      totalCoins: stats.totalCoins + coinsEarned,
      lives:      Math.max(0, stats.lives - (livesUsed ?? 0)),
      lastLifeAt: livesUsed > 0 ? Date.now() : stats.lastLifeAt,
    };
    setStats(newStats);
    saveLocal(newStats);

    // Sync backend
    if (!token) return { coinsEarned };
    try {
      const res  = await fetch(`${API}/api/quiz/stats`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),
      });
      const data = await res.json();
      if (data.coins != null) {
        const s = { ...newStats, coins: data.coins, lives: data.lives };
        setStats(s); saveLocal(s);
        return { coinsEarned: data.coinsEarned };
      }
    } catch {}
    return { coinsEarned };
  }, [stats, token]);

  // Utiliser une vie
  const useLife = useCallback(() => {
    if (stats.lives <= 0) return false;
    const s = { ...stats, lives: stats.lives - 1, lastLifeAt: Date.now() };
    setStats(s); saveLocal(s);
    return true;
  }, [stats]);

  // Acheter au shop
  const buyItem = useCallback(async (item) => {
    if (!token) return { success: false, error: "Connecte-toi pour acheter." };
    try {
      const res  = await fetch(`${API}/api/quiz/shop`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      const s = { ...stats, coins: data.coins, lives: data.lives };
      setStats(s); saveLocal(s);
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [stats, token]);

  return {
    coins:         stats.coins,
    lives:         stats.lives,
    totalCoins:    stats.totalCoins,
    freeHintsLeft: stats.freeHintsLeft ?? 0,
    nextLifeIn,
    loading,
    submitResult,
    useLife,
    buyItem,
    maxLives: MAX_LIVES,
  };
}
