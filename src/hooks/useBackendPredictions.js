// src/hooks/useBackendPredictions.js
// Récupère les pronostics depuis MongoDB (avec points) + sauvegarde

import { useState, useEffect, useCallback } from "react";

const API         = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY   = "wch_token";
const STORAGE_KEY = "wch_predictions";
const JOKER_KEY   = "wch_joker";

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function loadJoker() {
  const s = localStorage.getItem(JOKER_KEY);
  return s ? Number(s) : null;
}

export function useBackendPredictions() {
  const [predictions,  setPredictions]  = useState(loadLocal);
  const [jokerMatchId, setJokerMatchId] = useState(loadJoker);
  const [syncing,      setSyncing]      = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  // ── Charger les pronostics depuis MongoDB au montage ─────────────────────
  useEffect(() => {
    if (!token) return;
    async function fetchFromBackend() {
      try {
        const res  = await fetch(`${API}/api/predictions/me`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        // Convertir le tableau en objet indexé par matchId
        const map = {};
        for (const p of data.predictions ?? []) {
          map[p.matchId] = {
            scoreA:    p.scoreA,
            scoreB:    p.scoreB,
            isJoker:   p.isJoker,
            points:    p.points,
            breakdown: p.breakdown,
          };
          if (p.isJoker) setJokerMatchId(p.matchId);
        }

        // Fusionner avec localStorage (local prioritaire si plus récent)
        setPredictions(prev => ({ ...map, ...prev }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...map }));
      } catch (err) {
        console.warn("[fetchFromBackend]", err.message);
      }
    }
    fetchFromBackend();
  }, [token]);

  // ── Sauvegarder un pronostic ─────────────────────────────────────────────
  const savePrediction = useCallback(async (matchId, scores) => {
    const isJoker = jokerMatchId === matchId;
    const updated = {
      ...predictions,
      [matchId]: { ...scores, isJoker, points: null, breakdown: null },
    };
    setPredictions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

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
      console.warn("[savePrediction]", err.message);
    } finally {
      setSyncing(false);
    }
  }, [predictions, jokerMatchId, token]);

  // ── Joker ────────────────────────────────────────────────────────────────
  const handleSetJoker = useCallback((matchId) => {
    const newJoker = jokerMatchId === matchId ? null : matchId;
    setJokerMatchId(newJoker);
    if (newJoker) localStorage.setItem(JOKER_KEY, String(newJoker));
    else          localStorage.removeItem(JOKER_KEY);

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

  const getPrediction = useCallback((matchId) => predictions[matchId] ?? null, [predictions]);
  const hasJoker      = useCallback((matchId) => jokerMatchId === matchId, [jokerMatchId]);
  const savedCount    = Object.keys(predictions).length;

  return {
    predictions, savePrediction, handleSetJoker,
    getPrediction, hasJoker, jokerMatchId, savedCount, syncing,
  };
}
