// src/hooks/usePredictions.js
// Gère les pronostics en localStorage (remplacer par appels API quand backend prêt)
// Inspiré de la logique de LigiPredictor (MIT)

import { useState, useCallback } from "react";
import { calculatePoints } from "../utils/scoring";

const STORAGE_KEY = "wch_predictions_v2";
const JOKER_KEY   = "wch_jokers_v2";

function loadPredictions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function loadJokers() {
  try {
    return JSON.parse(localStorage.getItem(JOKER_KEY)) ?? {};
  } catch {
    return {};
  }
}

/**
 * Hook principal pour gérer les pronostics d'un joueur
 * @param {string} playerName - nom du joueur courant
 */
export function usePredictions(playerName) {
  const [predictions, setPredictions] = useState(loadPredictions);
  const [jokers, setJokers] = useState(loadJokers);

  // Sauvegarder un pronostic pour un match
  const savePrediction = useCallback((matchId, scoreA, scoreB) => {
    const updated = {
      ...predictions,
      [matchId]: {
        matchId,
        playerName,
        scoreA,
        scoreB,
        savedAt: new Date().toISOString(),
        points: null, // calculés quand le résultat réel arrive
      },
    };
    setPredictions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [predictions, playerName]);

  // Poser/retirer son joker sur un match
  const toggleJoker = useCallback((matchId) => {
    // On retire l'ancien joker s'il existe
    const updated = {};
    if (!jokers[matchId]) {
      updated[matchId] = true;
    }
    setJokers(updated);
    localStorage.setItem(JOKER_KEY, JSON.stringify(updated));
  }, [jokers]);

  // Récupérer le pronostic d'un match
  const getPrediction = useCallback((matchId) => {
    return predictions[matchId] ?? null;
  }, [predictions]);

  // Vérifier si un match a le joker
  const hasJoker = useCallback((matchId) => {
    return !!jokers[matchId];
  }, [jokers]);

  // Calculer les points (si résultat réel dispo)
  const getPoints = useCallback((matchId, realA, realB) => {
    const pred = predictions[matchId];
    if (!pred || pred.scoreA == null || pred.scoreB == null) return null;
    return calculatePoints(pred.scoreA, pred.scoreB, realA, realB, hasJoker(matchId));
  }, [predictions, hasJoker]);

  // Tous les pronostics du joueur courant
  const myPredictions = Object.values(predictions)
    .filter(p => p.playerName === playerName);

  // Total de matchs pronostiqués
  const predictedCount = myPredictions.length;

  return {
    savePrediction,
    toggleJoker,
    getPrediction,
    hasJoker,
    getPoints,
    myPredictions,
    predictedCount,
  };
}
