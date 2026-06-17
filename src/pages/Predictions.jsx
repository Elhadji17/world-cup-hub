// src/pages/Predictions.jsx
// Version finale — useBackendPredictions (MongoDB) + localStorage fallback

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATCHES, getUpcomingMatches } from "../data/matches";
import { useResults } from "../hooks/useResults";
import { AI_PREDICTIONS } from "../data/aiPredictions";
import { getMedal, agreesWithAI } from "../utils/scoring";
import { useBackendPredictions } from "../hooks/useBackendPredictions";
import { useAuth } from "../hooks/useAuth";
import MatchCard from "../components/MatchCard";
import Leaderboard from "../components/Leaderboard";
import { useState } from "react";

export default function Predictions() {
  const { user } = useAuth();
  const { getResult } = useResults();
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  const {
    predictions,
    savePrediction,
    handleSetJoker,
    getPrediction,
    hasJoker,
    jokerMatchId,
    savedCount,
    syncing,
  } = useBackendPredictions();

  const [activeGroup,     setActiveGroup]     = useState("ALL");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const medal = getMedal(savedCount * 8);

  // Matchs affichés selon le filtre
  // Remplace dans Predictions.jsx :
  const displayedMatches = useMemo(() => {
    if (activeGroup === "ALL") return getUpcomingMatches(12);
    return MATCHES.filter(m => m.group === activeGroup);
  }, [activeGroup]);

  const groups = ["ALL", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-black to-purple-900 text-white pb-16">

      {/* ── HEADER STICKY ── */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🔮 Pronostics</h1>
            <p className="text-xs text-gray-400">
              {savedCount} pronostic{savedCount > 1 ? "s" : ""} enregistré{savedCount > 1 ? "s" : ""}
              {jokerMatchId ? " · ⭐ Joker posé" : " · ⭐ Joker disponible"}
              {syncing && " · 🔄 Sync..."}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-400">
                {medal.emoji} {playerName}
              </div>
              <div className="text-xs text-gray-400">{medal.label}</div>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-sm font-bold transition"
            >
              🏆
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* ── Note sync backend — EN HAUT ── */}
        {!user && (
          <div className="mb-4 bg-amber-500/20 border border-amber-400/50 rounded-xl px-4 py-3 text-sm text-amber-200 text-center font-semibold">
            💡 Connecte-toi pour sauvegarder tes pronostics et apparaître au classement.
          </div>
        )}
        
        {/* ── INFO JOKER ── */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4 mb-4 text-sm">
          <p className="font-bold text-yellow-300 mb-1">⭐ Règle du Joker</p>
          <p className="text-gray-300">
            Utilise le bouton ⭐ sur le match où tu es <strong>le plus confiant</strong>.
            Si ton pronostic est correct, tu obtiens <strong>le double des points</strong> !
            Tu peux changer ton joker à tout moment avant le coup d'envoi.
          </p>
        </div>

        {/* ── LÉGENDE POINTS ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-sm">
          <p className="font-bold text-white mb-3">🎯 Système de points</p>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>🎯 Score exact (ex: 2-1 = 2-1)</span>
              <span className="text-green-400 font-bold">+15 pts</span>
            </div>
            <div className="flex justify-between">
              <span>✅ Bon résultat (ex: victoire/nul/défaite)</span>
              <span className="text-blue-400 font-bold">+7 pts</span>
            </div>
            <div className="flex justify-between">
              <span>📊 Bon écart de buts</span>
              <span className="text-blue-400 font-bold">+3 pts</span>
            </div>
            <div className="flex justify-between">
              <span>⚽ Buts d'une équipe exacts</span>
              <span className="text-orange-400 font-bold">+1 pt chacun</span>
            </div>
            <div className="flex justify-between">
              <span>🔢 Score proche (±1 but)</span>
              <span className="text-orange-400 font-bold">+2 pts</span>
            </div>
            <div className="flex justify-between">
              <span>⭐ Joker sur bon pronostic</span>
              <span className="text-yellow-400 font-bold">×2 pts</span>
            </div>
          </div>
        </div>

        {/* ── FILTRES GROUPES ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition
                ${activeGroup === g
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
            >
              {g === "ALL" ? "À venir" : `Gr. ${g}`}
            </button>
          ))}
        </div>

        {/* ── LEADERBOARD / DASHBOARD ── */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <Leaderboard
                predictions={predictions}
                jokerMatchId={jokerMatchId}
                playerName={playerName}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LISTE DES MATCHS ── */}
        <div className="grid gap-4">
          <AnimatePresence>
            {displayedMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={getPrediction(match.id)}
                isJoker={hasJoker(match.id)}
                onSave={savePrediction}
                onJoker={handleSetJoker}
                result={getResult(match.id)}
                user={user}  // ← ajoute ça
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Message si aucun match ── */}
        {displayedMatches.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">📭</div>
            <p>Aucun match dans ce groupe pour l'instant.</p>
          </div>
        )}

        

      </div>
    </div>
  );
}
