// src/components/Leaderboard.jsx
// Dashboard + classement local — conçu pour Predictions.jsx
// Props reçues : predictions (object), jokerMatchId, playerName, aiPredictions
// Utilise : getMedal, computeLeaderboardScore, agreesWithAI depuis scoring.js

import { useMemo } from "react";
import { motion } from "framer-motion";
import { getMedal, agreesWithAI } from "../utils/scoring";
import { AI_PREDICTIONS } from "../data/aiPredictions";

// ── Classement local mono-joueur ──────────────────────────────────────────────
// (Quand le backend sera prêt, on recevra un vrai tableau multi-joueurs via API)
function buildLocalLeaderboard(predictions) {
  // Pour l'instant : un seul joueur en local
  // Structure extensible pour multi-joueurs via backend
  return Object.entries(predictions).map(([matchId, pred]) => ({
    matchId: Number(matchId),
    scoreA:  pred.scoreA,
    scoreB:  pred.scoreB,
  }));
}

export default function Leaderboard({ predictions, jokerMatchId, playerName }) {
  const savedCount = Object.keys(predictions).length;
  const medal = getMedal(savedCount * 8); // estimation avant résultats réels

  // Nombre de pronostics d'accord avec l'IA
  const agreesCount = useMemo(() => {
    return Object.entries(predictions).filter(([id, pred]) => {
      const ai = AI_PREDICTIONS[Number(id)];
      if (!ai) return false;
      return agreesWithAI(pred, { scoreA: ai.scoreA, scoreB: ai.scoreB });
    }).length;
  }, [predictions]);

  // Défie l'IA
  const defiCount = savedCount - agreesCount;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">

      {/* ── Titre + médaille ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">🏆 Ton tableau de bord</h2>
        <div className="text-right">
          <div className="text-sm font-bold text-yellow-400">
            {medal.emoji} {playerName}
          </div>
          <div className="text-xs text-gray-400">{medal.label}</div>
        </div>
      </div>

      {/* ── Stats en 3 colonnes ── */}
      <div className="grid grid-cols-3 gap-3 text-center mb-4">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-black/30 rounded-xl p-3"
        >
          <div className="text-2xl font-bold text-blue-400">{savedCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">Pronostic{savedCount > 1 ? "s" : ""}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-black/30 rounded-xl p-3"
        >
          <div className="text-2xl font-bold text-yellow-400">
            {jokerMatchId ? "⭐" : "—"}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {jokerMatchId ? "Joker posé" : "Joker dispo"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 rounded-xl p-3"
        >
          <div className="text-2xl font-bold text-green-400">{agreesCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">Avec l'IA</div>
        </motion.div>
      </div>

      {/* ── Barre IA vs Défi ── */}
      {savedCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>✅ Accord IA ({agreesCount})</span>
            <span>⚡ Défi IA ({defiCount})</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((agreesCount / savedCount) * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            />
          </div>
        </div>
      )}

      {/* ── Règles de scoring ── */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
          Barème des points
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            ["🎯 Score exact",        "15 pts",  "text-green-400"],
            ["✅ Résultat + écart",   "10 pts",  "text-blue-400"],
            ["✅ Bon résultat",        "7 pts",   "text-blue-300"],
            ["📐 Bon écart",          "3 pts",   "text-yellow-400"],
            ["🎯 Buts exacts (A/B)",  "1 pt ×2", "text-yellow-300"],
            ["📏 Score proche ±1",    "2 pts",   "text-orange-400"],
            ["⭐ Joker",              "×2",      "text-yellow-400"],
          ].map(([label, pts, color]) => (
            <div key={label} className="flex justify-between bg-white/5 rounded-lg px-2 py-1.5">
              <span className="text-gray-300">{label}</span>
              <span className={`font-bold ${color}`}>{pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Note backend ── */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Le classement multijoueur sera disponible avec le backend 🚀
      </p>
    </div>
  );
}
