// src/pages/Leaderboard.jsx
// Classement multijoueur — données réelles depuis /api/leaderboard

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { getMedal } from "../utils/scoring";

const API = import.meta.env.VITE_API_URL ?? "";

const RANK_STYLE = [
  "bg-yellow-500/20 border-yellow-400/50 shadow-yellow-400/10 shadow-lg",
  "bg-gray-400/10   border-gray-400/30",
  "bg-amber-700/10  border-amber-600/30",
];
const RANK_EMOJI = ["🥇", "🥈", "🥉"];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-xl animate-pulse">
      <div className="w-7 h-5 bg-white/10 rounded" />
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-white/10 rounded w-32" />
        <div className="h-2 bg-white/10 rounded w-20" />
      </div>
      <div className="w-10 h-6 bg-white/10 rounded" />
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchLeaderboard() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/leaderboard?limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      setLeaderboard(data.leaderboard);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLeaderboard(); }, []);

  // Trouver le rang du joueur connecté
  const myRank = user
    ? leaderboard.find(e => e.username === user.username)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-black to-blue-900 text-white pb-16">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🏆 Classement</h1>
            <p className="text-xs text-gray-400">
              {lastUpdated
                ? `Mis à jour à ${lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                : "Chargement..."
              }
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchLeaderboard}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-bold transition"
          >
            {loading ? "⏳" : "🔄"}
          </motion.button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* ── MON RANG (si connecté et classé) ── */}
        <AnimatePresence>
          {myRank && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-blue-600/20 border border-blue-400/40 rounded-2xl px-5 py-4"
            >
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide mb-2">
                Ta position
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">
                    {RANK_EMOJI[myRank.rank - 1] ?? `#${myRank.rank}`}
                  </span>
                  <div>
                    <div className="font-bold text-white">{myRank.username}</div>
                    <div className="text-xs text-gray-400">
                      {myRank.exactScores} exact · {myRank.correctResults} bon résultat · {myRank.predictions} pronostics
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">{myRank.totalPoints}</div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PODIUM TOP 3 ── */}
        {!loading && leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-8 px-2">
            {/* 2ème */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 bg-gray-400/10 border border-gray-400/30 rounded-2xl p-4 text-center"
            >
              <div className="text-3xl mb-1">🥈</div>
              <div className="text-sm font-bold truncate">{leaderboard[1].username}</div>
              <div className="text-lg font-bold text-gray-300">{leaderboard[1].totalPoints}</div>
              <div className="text-xs text-gray-500">pts</div>
            </motion.div>

            {/* 1er */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex-1 bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-5 text-center shadow-lg shadow-yellow-400/10 -translate-y-3"
            >
              <div className="text-4xl mb-1">🥇</div>
              <div className="text-sm font-bold truncate">{leaderboard[0].username}</div>
              <div className="text-xl font-bold text-yellow-300">{leaderboard[0].totalPoints}</div>
              <div className="text-xs text-gray-400">pts</div>
            </motion.div>

            {/* 3ème */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 bg-amber-700/10 border border-amber-600/30 rounded-2xl p-4 text-center"
            >
              <div className="text-3xl mb-1">🥉</div>
              <div className="text-sm font-bold truncate">{leaderboard[2].username}</div>
              <div className="text-lg font-bold text-amber-400">{leaderboard[2].totalPoints}</div>
              <div className="text-xs text-gray-500">pts</div>
            </motion.div>
          </div>
        )}

        {/* ── ERREUR ── */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm text-center mb-4">
            ⚠️ {error}
            <button onClick={fetchLeaderboard} className="ml-2 underline">Réessayer</button>
          </div>
        )}

        {/* ── LISTE COMPLÈTE ── */}
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : leaderboard.length === 0
              ? (
                <div className="text-center text-gray-400 py-20">
                  <div className="text-5xl mb-4">🏜️</div>
                  <p className="font-semibold">Aucun joueur classé pour l'instant.</p>
                  <p className="text-sm mt-2">Les points sont calculés après chaque match.</p>
                </div>
              )
              : leaderboard.map((entry, i) => {
                  const isMe    = user?.username === entry.username;
                  const medal   = getMedal(entry.totalPoints);
                  const bgStyle = RANK_STYLE[i] ?? "bg-white/5 border-white/10";

                  return (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition ${bgStyle} ${
                        isMe ? "ring-2 ring-blue-400/50" : ""
                      }`}
                    >
                      {/* Rang */}
                      <div className="w-7 text-center text-lg font-bold">
                        {RANK_EMOJI[i] ?? <span className="text-sm text-gray-400">#{entry.rank}</span>}
                      </div>

                      {/* Infos joueur */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${isMe ? "text-blue-300" : "text-white"}`}>
                            {entry.username}
                          </span>
                          {isMe && <span className="text-xs text-blue-400 shrink-0">(toi)</span>}
                          <span className="text-sm shrink-0">{medal.emoji}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          🎯 {entry.exactScores} exact · ✅ {entry.correctResults} résultat · 📋 {entry.predictions} pronostics
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-white">{entry.totalPoints}</div>
                        <div className="text-xs text-gray-400">pts</div>
                      </div>
                    </motion.div>
                  );
                })
          }
        </div>

        {/* ── Note ── */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Les points sont mis à jour après chaque match officiel ⚽
        </p>

      </div>
    </div>
  );
}
