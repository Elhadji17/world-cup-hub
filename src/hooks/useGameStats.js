// src/hooks/useGameStats.js
// Gestion coins + vies — MongoDB prioritaire sur localStorage

import { useState, useEffect, useCallback } from "react";

const API       = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "wch_token";
const LOCAL_KEY = "wch_gamestats";

const MAX_LIVES     = 5;
const LIFE_REGEN_MS = 60 * 60 * 1000;

const DEFAULT_STATS = {
  coins: 0, lives: MAX_LIVES, totalCoins: 0,
  lastLifeAt: Date.now(), freeHintsLeft: 0,
  nextLifeIn: null, isDoubleCoins: false,
};

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? DEFAULT_STATS; }
  catch { return DEFAULT_STATS; }
}

function saveLocal(stats) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(stats));
}

// Régénération locale (quand pas de réseau)
function regenLivesLocal(stats) {
  if (stats.lives >= MAX_LIVES) return stats;
  const elapsed  = Date.now() - (stats.lastLifeAt ?? Date.now());
  const regenned = Math.floor(elapsed / LIFE_REGEN_MS);
  if (regenned <= 0) return stats;
  return {
    ...stats,
    lives:      Math.min(stats.lives + regenned, MAX_LIVES),
    lastLifeAt: (stats.lastLifeAt ?? Date.now()) + regenned * LIFE_REGEN_MS,
  };
}

export function useGameStats() {
  const [stats,   setStats]   = useState(() => regenLivesLocal(loadLocal()));
  const [loading, setLoading] = useState(false);
  const [synced,  setSynced]  = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  // ── Charger depuis MongoDB au montage — PRIORITAIRE sur localStorage ──────
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/quiz?action=stats`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.coins != null) {
          // MongoDB est la source de vérité — on écrase localStorage
          const fresh = {
            coins:         data.coins,
            lives:         data.lives,
            totalCoins:    data.totalCoins,
            lastLifeAt:    Date.now(),
            freeHintsLeft: data.freeHintsLeft ?? 0,
            nextLifeIn:    data.nextLifeIn,
            isDoubleCoins: data.isDoubleCoins ?? false,
          };
          setStats(fresh);
          saveLocal(fresh);
          setSynced(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // ── Temps avant prochaine vie ─────────────────────────────────────────────
  const nextLifeIn = stats.lives >= MAX_LIVES
    ? null
    : Math.max(0, LIFE_REGEN_MS - (Date.now() - (stats.lastLifeAt ?? Date.now())));

  // ── Soumettre résultat d'une partie ──────────────────────────────────────
  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers, livesUsed }) => {
    // Calcul local immédiat
    const coinsEarned = (correct * 10) +
      ((fastAnswers ?? 0) * 10) +
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
      const res  = await fetch(`${API}/api/quiz?action=submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),
      });
      const data = await res.json();
      if (data.coins != null) {
        const synced = { ...newStats, coins: data.coins, lives: data.lives };
        setStats(synced);
        saveLocal(synced);
        return { coinsEarned: data.coinsEarned ?? coinsEarned };
      }
    } catch {}
    return { coinsEarned };
  }, [stats, token]);

  // ── Utiliser une vie ──────────────────────────────────────────────────────
  const useLife = useCallback(() => {
    if (stats.lives <= 0) return false;
    const s = { ...stats, lives: stats.lives - 1, lastLifeAt: Date.now() };
    setStats(s);
    saveLocal(s);
    return true;
  }, [stats]);

  // ── Acheter au shop ───────────────────────────────────────────────────────
  const buyItem = useCallback(async (item) => {
    if (!token) return { success: false, error: "Connecte-toi pour acheter." };
    try {
      const res  = await fetch(`${API}/api/quiz?action=shop`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      // Mettre à jour immédiatement avec les vraies valeurs MongoDB
      const s = { ...stats, coins: data.coins, lives: data.lives };
      setStats(s);
      saveLocal(s);
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [stats, token]);

  // ── Rafraîchir manuellement depuis MongoDB ────────────────────────────────
  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${API}/api/quiz?action=stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.coins != null) {
        const fresh = {
          coins: data.coins, lives: data.lives, totalCoins: data.totalCoins,
          lastLifeAt: Date.now(), freeHintsLeft: data.freeHintsLeft ?? 0,
          nextLifeIn: data.nextLifeIn, isDoubleCoins: data.isDoubleCoins ?? false,
        };
        setStats(fresh);
        saveLocal(fresh);
      }
    } catch {}
  }, [token]);

  return {
    coins:         stats.coins,
    lives:         stats.lives,
    totalCoins:    stats.totalCoins,
    freeHintsLeft: stats.freeHintsLeft ?? 0,
    nextLifeIn,
    loading,
    synced,
    submitResult,
    useLife,
    buyItem,
    refresh,
    maxLives: MAX_LIVES,
  };
}
