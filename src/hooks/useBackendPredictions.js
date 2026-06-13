// src/hooks/useBackendPredictions.js
// Sauvegarde les pronostics sur MongoDB via /api/predictions/save
// Fallback localStorage si l'utilisateur n'est pas connecté

import { useState, useCallback } from "react";

const API         = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY   = "wch_token";
const STORAGE_KEY = "wch_predictions";
const JOKER_KEY   = "wch_joker";

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function loadJoker() {
  const stored = localStorage.getItem(JOKER_KEY);
  return stored ? Number(stored) : null;
}

export function useBackendPredictions() {
  const [predictions,  setPredictions]  = useState(loadLocal);
  const [jokerMatchId, setJokerMatchId] = useState(loadJoker);
  const [syncing,      setSyncing]      = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  // ── Sauvegarder un pronostic ─────────────────────────────────────────────
  const savePrediction = useCallback(async (matchId, scores) => {
    const isJoker = jokerMatchId === matchId;

    // Sauvegarde locale immédiate
    const updated = { ...predictions, [matchId]: { ...scores, isJoker } };
    setPredictions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Sync backend si connecté
    if (!token) return;
    setSyncing(true);
    try {
      await fetch(`${API}/api/predictions/save`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, ...scores, isJoker }),
      });
    } catch (err) {
      console.warn("[savePrediction] backend error:", err.message);
    } finally {
      setSyncing(false);
    }
  }, [predictions, jokerMatchId, token]);

  // ── Poser / retirer le joker ─────────────────────────────────────────────
  const handleSetJoker = useCallback((matchId) => {
    const newJoker = jokerMatchId === matchId ? null : matchId;
    setJokerMatchId(newJoker);
    if (newJoker) localStorage.setItem(JOKER_KEY, String(newJoker));
    else          localStorage.removeItem(JOKER_KEY);

    // Re-sync la prédiction existante avec le nouveau statut joker
    const pred = predictions[matchId];
    if (pred && token) {
      fetch(`${API}/api/predictions/save`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          scoreA:  pred.scoreA,
          scoreB:  pred.scoreB,
          isJoker: !!newJoker,
        }),
      }).catch(err => console.warn("[joker sync]", err.message));
    }
  }, [jokerMatchId, predictions, token]);

  const getPrediction  = useCallback((matchId) => predictions[matchId] ?? null, [predictions]);
  const hasJoker       = useCallback((matchId) => jokerMatchId === matchId, [jokerMatchId]);
  const savedCount     = Object.keys(predictions).length;

  return {
    predictions,
    savePrediction,
    handleSetJoker,
    getPrediction,
    hasJoker,
    jokerMatchId,
    savedCount,
    syncing,
  };
}
