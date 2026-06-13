// src/pages/Predictions.jsx
// Version finale — ton code avec MatchCard et Leaderboard intégrés
// Inspired by LigiPredictor (MIT) + all_leagues-prediction (MIT)

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATCHES, FLAGS, getUpcomingMatches } from "../data/matches";
import { AI_PREDICTIONS, getConfidenceColor, getConfidenceBg } from "../data/aiPredictions";
import { calculatePoints, getOutcome, agreesWithAI, getMedal } from "../utils/scoring";
import MatchCard from "../components/MatchCard";
import Leaderboard from "../components/Leaderboard";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = "wch_predictions";
const JOKER_KEY   = "wch_joker";

function loadPredictions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function savePredictions(preds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preds));
}
function loadJoker() {
  return localStorage.getItem(JOKER_KEY) || null;
}
function saveJoker(matchId) {
  localStorage.setItem(JOKER_KEY, String(matchId));
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Predictions() {
  const [predictions, setPredictions] = useState(loadPredictions);
  const [jokerMatchId, setJokerMatchId] = useState(() => {
    const stored = loadJoker();
    return stored ? Number(stored) : null;
  });
  const [activeGroup, setActiveGroup] = useState("ALL");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const playerName = localStorage.getItem("playerName") || "Joueur";

  // Matchs affichés selon le filtre actif
  const displayedMatches = useMemo(() => {
    if (activeGroup === "ALL") return getUpcomingMatches(12);
    return MATCHES.filter(m => m.group === activeGroup);
  }, [activeGroup]);

  function handleSavePrediction(matchId, scores) {
    const updated = { ...predictions, [matchId]: scores };
    setPredictions(updated);
    savePredictions(updated);
  }

  function handleSetJoker(matchId) {
    const newJoker = jokerMatchId === matchId ? null : matchId;
    setJokerMatchId(newJoker);
    if (newJoker) saveJoker(newJoker);
    else localStorage.removeItem(JOKER_KEY);
  }

  const savedCount = Object.keys(predictions).length;
  const medal = getMedal(savedCount * 8);

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
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-400">{medal.emoji} {playerName}</div>
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
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
          <div className="bg-white/10 rounded-xl py-2 px-1">
            <div className="text-green-400 font-bold text-lg">15 pts</div>
            <div className="text-gray-400">Score exact</div>
          </div>
          <div className="bg-white/10 rounded-xl py-2 px-1">
            <div className="text-blue-400 font-bold text-lg">7–10 pts</div>
            <div className="text-gray-400">Bon résultat</div>
          </div>
          <div className="bg-white/10 rounded-xl py-2 px-1">
            <div className="text-orange-400 font-bold text-lg">2 pts</div>
            <div className="text-gray-400">Score proche</div>
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
                prediction={predictions[match.id] || null}
                isJoker={jokerMatchId === match.id}
                onSave={handleSavePrediction}
                onJoker={handleSetJoker}
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
