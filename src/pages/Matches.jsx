// src/pages/Matches.jsx
// Calendrier complet WC 2026 — groupes A→L, statuts, résultats

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATCHES, FLAGS, GROUPS } from "../data/matches";
import { AI_PREDICTIONS } from "../data/aiPredictions";

// Statut d'un match selon la date actuelle
function getMatchStatus(dateStr, timeStr) {
  const now       = new Date();
  const matchDate = new Date(`${dateStr}T${timeStr}:00`);
  const endDate   = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000); // +2h

  if (now < matchDate) return "upcoming";
  if (now >= matchDate && now <= endDate) return "live";
  return "finished";
}

function StatusBadge({ status }) {
  if (status === "live") return (
    <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
      🔴 LIVE
    </span>
  );
  if (status === "finished") return (
    <span className="bg-gray-600 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full">
      Terminé
    </span>
  );
  return (
    <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
      À venir
    </span>
  );
}

function MatchRow({ match }) {
  const status = getMatchStatus(match.date, match.time);
  const ai     = AI_PREDICTIONS[match.id];
  const [showAI, setShowAI] = useState(false);

  const flagA = FLAGS[match.teamA] ?? "🏳️";
  const flagB = FLAGS[match.teamB] ?? "🏳️";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 transition ${
        status === "live"
          ? "bg-red-500/10 border-red-500/40 shadow-red-500/10 shadow-lg"
          : status === "finished"
            ? "bg-white/5 border-white/10"
            : "bg-white/8 border-white/10"
      }`}
    >
      {/* En-tête */}
      <div className="flex justify-between items-center mb-3 text-xs text-gray-400">
        <StatusBadge status={status} />
        <span>🕒 {match.date} · {match.time}</span>
        <span>📍 {match.stadium}</span>
      </div>

      {/* Équipes */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{flagA}</div>
          <div className="text-sm font-bold leading-tight">{match.teamA}</div>
        </div>

        <div className="mx-4 text-center">
          {status === "finished" ? (
            <div className="text-2xl font-bold text-white">
              ? – ?
            </div>
          ) : status === "live" ? (
            <div className="text-2xl font-bold text-red-400 animate-pulse">
              En cours
            </div>
          ) : (
            <div className="text-lg text-gray-500 font-bold">vs</div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{flagB}</div>
          <div className="text-sm font-bold leading-tight">{match.teamB}</div>
        </div>
      </div>

      {/* Prédiction IA */}
      {ai && status === "upcoming" && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <button
            onClick={() => setShowAI(!showAI)}
            className="w-full text-xs text-purple-300 hover:text-purple-200 font-semibold transition flex items-center justify-center gap-1"
          >
            🤖 {showAI ? "Masquer" : "Voir"} la prédiction IA
          </button>

          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 text-xs text-center"
              >
                <div className="flex items-center justify-center gap-4 my-2">
                  <span className="text-2xl font-bold text-white">{ai.scoreA}</span>
                  <span className="text-gray-500">–</span>
                  <span className="text-2xl font-bold text-white">{ai.scoreB}</span>
                </div>
                <div className="text-purple-300 font-semibold mb-1">
                  {ai.winner === "Draw" ? "🤝 Match nul prédit" : `🏆 ${ai.winner} favori`}
                  <span className={`ml-2 font-bold ${
                    ai.confidence >= 75 ? "text-green-400"
                    : ai.confidence >= 55 ? "text-yellow-400"
                    : "text-orange-400"
                  }`}>
                    {ai.confidence}%
                  </span>
                </div>
                <p className="text-gray-400 italic">"{ai.reasoning}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

const FILTER_GROUPS = ["TOUS", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const FILTER_STATUS = [
  { id: "all",      label: "Tous"     },
  { id: "live",     label: "🔴 Live"  },
  { id: "upcoming", label: "À venir"  },
  { id: "finished", label: "Terminés" },
];

export default function Matches() {
  const [activeGroup,  setActiveGroup]  = useState("TOUS");
  const [activeStatus, setActiveStatus] = useState("all");

  const filtered = useMemo(() => {
    return MATCHES.filter(m => {
      const status    = getMatchStatus(m.date, m.time);
      const groupOk   = activeGroup === "TOUS" || m.group === activeGroup;
      const statusOk  = activeStatus === "all"  || status === activeStatus;
      return groupOk && statusOk;
    });
  }, [activeGroup, activeStatus]);

  // Stats rapides
  const stats = useMemo(() => {
    const live     = MATCHES.filter(m => getMatchStatus(m.date, m.time) === "live").length;
    const finished = MATCHES.filter(m => getMatchStatus(m.date, m.time) === "finished").length;
    const upcoming = MATCHES.filter(m => getMatchStatus(m.date, m.time) === "upcoming").length;
    return { live, finished, upcoming, total: MATCHES.length };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-black to-blue-900 text-white pb-16">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">📅 Match Center</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.total} matchs · {stats.live > 0 ? `🔴 ${stats.live} live · ` : ""}
            {stats.finished} terminés · {stats.upcoming} à venir
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* ── FILTRE STATUT ── */}
        <div className="flex gap-2 mb-4">
          {FILTER_STATUS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveStatus(id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                activeStatus === id
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── FILTRE GROUPE ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTER_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeGroup === g
                  ? "bg-white text-black"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {g === "TOUS" ? "Tous" : `Gr. ${g}`}
            </button>
          ))}
        </div>

        {/* ── LISTE MATCHS ── */}
        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map(match => (
              <MatchRow key={match.id} match={match} />
            ))}
          </AnimatePresence>
        </div>

        {/* Aucun match */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">📭</div>
            <p>Aucun match pour ce filtre.</p>
          </div>
        )}

      </div>
    </div>
  );
}
