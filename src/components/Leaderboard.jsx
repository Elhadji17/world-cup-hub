// src/pages/Leaderboard.jsx
// Classement unifié — Quiz (points) + Pronostics

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }      from "../hooks/useAuth";
import { useGameStats } from "../hooks/useGameStats.jsx";

const API = import.meta.env.VITE_API_URL ?? "";

const RANK_EMOJI  = ["🥇", "🥈", "🥉"];
const RANK_STYLE  = [
  "bg-yellow-500/20 border-yellow-400/50 shadow-yellow-400/10 shadow-lg",
  "bg-gray-400/10   border-gray-400/30",
  "bg-amber-700/10  border-amber-600/30",
];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-xl animate-pulse">
      <div className="w-7 h-5 bg-white/10 rounded" />
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-white/10 rounded w-32" />
        <div className="h-2 bg-white/10 rounded w-20" />
      </div>
      <div className="w-12 h-6 bg-white/10 rounded" />
    </div>
  );
}

// ── Classement Quiz ───────────────────────────────────────────────────────────
function QuizLeaderboard({ user, myPoints }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  async function fetch_() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/quiz?action=leaderboard&limit=50`);
      const json = await res.json();
      if (res.ok) { setData(json.leaderboard ?? []); setUpdated(new Date()); }
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, []);

  const myRank = user ? data.find(e => e.username === user.username) : null;

  return (
    <div>
      {/* Mon rang */}
      {myRank && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-5 bg-blue-600/20 border border-blue-400/40 rounded-2xl px-5 py-4">
          <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide mb-2">Ta position</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{RANK_EMOJI[myRank.rank - 1] ?? `#${myRank.rank}`}</span>
              <div>
                <div className="font-bold">{myRank.username} <span className="text-blue-300 text-xs">(toi)</span></div>
                <div className="text-xs text-gray-400">
                  {myRank.quizPlayed} parties · {myRank.accuracy}% · 🔥 {myRank.bestStreak}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{myRank.totalPoints}</div>
              <div className="text-xs text-gray-400">pts</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Podium top 3 */}
      {!loading && data.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {[1, 0, 2].map((idx, pos) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pos * 0.1 }}
              className={`flex-1 rounded-2xl p-4 text-center border ${RANK_STYLE[idx]} ${idx === 0 ? "-translate-y-3 p-5" : ""}`}
            >
              <div className={`mb-1 ${idx === 0 ? "text-4xl" : "text-3xl"}`}>{RANK_EMOJI[idx]}</div>
              <div className="text-sm font-bold truncate">{data[idx]?.username}</div>
              <div className={`font-bold ${idx === 0 ? "text-xl text-yellow-300" : "text-lg text-gray-300"}`}>
                {data[idx]?.totalPoints} pts
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-gray-500">
          {updated ? `Mis à jour à ${updated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={fetch_}
          className="text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-1 rounded-lg transition">
          {loading ? "⏳" : "🔄 Actualiser"}
        </motion.button>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : data.length === 0
            ? (
              <div className="text-center text-gray-400 py-16">
                <div className="text-5xl mb-3">🏜️</div>
                <p>Aucun joueur classé.</p>
                <p className="text-sm mt-1">Joue au Quiz pour apparaître ici !</p>
              </div>
            )
            : data.map((e, i) => {
                const isMe = user?.username === e.username;
                return (
                  <motion.div key={e.username}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      RANK_STYLE[i] ?? "bg-white/5 border-white/10"
                    } ${isMe ? "ring-2 ring-blue-400/50" : ""}`}
                  >
                    <div className="w-7 text-center">
                      {RANK_EMOJI[i] ?? <span className="text-sm text-gray-400">#{e.rank}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold truncate ${isMe ? "text-blue-300" : "text-white"}`}>
                          {e.username}
                        </span>
                        {isMe && <span className="text-xs text-blue-400">⚽</span>}
                      </div>
                      <div className="text-xs text-gray-400">{e.quizPlayed} parties · {e.accuracy}% · 🔥{e.bestStreak}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-400">{e.totalPoints}</div>
                      <div className="text-xs text-gray-400">pts</div>
                    </div>
                  </motion.div>
                );
              })
        }
      </div>
    </div>
  );
}

// ── Classement Pronostics ─────────────────────────────────────────────────────
function PronosLeaderboard({ user }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  async function fetch_() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/leaderboard?limit=50`);
      const json = await res.json();
      if (res.ok) { setData(json.leaderboard ?? []); setUpdated(new Date()); }
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, []);

  const myRank = user ? data.find(e => e.username === user.username) : null;

  return (
    <div>
      {/* Mon rang */}
      {myRank && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-5 bg-blue-600/20 border border-blue-400/40 rounded-2xl px-5 py-4">
          <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide mb-2">Ta position</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{RANK_EMOJI[myRank.rank - 1] ?? `#${myRank.rank}`}</span>
              <div>
                <div className="font-bold">{myRank.username} <span className="text-blue-300 text-xs">(toi)</span></div>
                <div className="text-xs text-gray-400">
                  🎯 {myRank.exactScores} exact · ✅ {myRank.correctResults} résultats · 📋 {myRank.predictions} pronos
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{myRank.totalPoints}</div>
              <div className="text-xs text-gray-400">pts</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Podium top 3 */}
      {!loading && data.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {[1, 0, 2].map((idx, pos) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pos * 0.1 }}
              className={`flex-1 rounded-2xl p-4 text-center border ${RANK_STYLE[idx]} ${idx === 0 ? "-translate-y-3 p-5" : ""}`}
            >
              <div className={`mb-1 ${idx === 0 ? "text-4xl" : "text-3xl"}`}>{RANK_EMOJI[idx]}</div>
              <div className="text-sm font-bold truncate">{data[idx]?.username}</div>
              <div className={`font-bold ${idx === 0 ? "text-xl text-green-300" : "text-lg text-gray-300"}`}>
                {data[idx]?.totalPoints} pts
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-gray-500">
          {updated ? `Mis à jour à ${updated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={fetch_}
          className="text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-1 rounded-lg transition">
          {loading ? "⏳" : "🔄 Actualiser"}
        </motion.button>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : data.length === 0
            ? (
              <div className="text-center text-gray-400 py-16">
                <div className="text-5xl mb-3">🏜️</div>
                <p>Aucun pronostic classé.</p>
                <p className="text-sm mt-1">Les points sont calculés après chaque match ⚽</p>
              </div>
            )
            : data.map((e, i) => {
                const isMe = user?.username === e.username;
                return (
                  <motion.div key={e.username}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      RANK_STYLE[i] ?? "bg-white/5 border-white/10"
                    } ${isMe ? "ring-2 ring-blue-400/50" : ""}`}
                  >
                    <div className="w-7 text-center">
                      {RANK_EMOJI[i] ?? <span className="text-sm text-gray-400">#{e.rank}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold truncate ${isMe ? "text-blue-300" : "text-white"}`}>
                          {e.username}
                        </span>
                        {isMe && <span className="text-xs text-blue-400">⚽</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        🎯 {e.exactScores} exact · ✅ {e.correctResults} bons · 📋 {e.predictions}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">{e.totalPoints}</div>
                      <div className="text-xs text-gray-400">pts</div>
                    </div>
                  </motion.div>
                );
              })
        }
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user }                 = useAuth();
  const { totalPoints: myPoints } = useGameStats();
  const [tab, setTab]            = useState("quiz");

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-black to-blue-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-3">🏆 Classement</h1>

          {/* Onglets */}
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab("quiz")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                tab === "quiz"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🧠 Quiz
            </button>
            <button
              onClick={() => setTab("pronos")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                tab === "pronos"
                  ? "bg-green-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🔮 Pronostics
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        <AnimatePresence mode="wait">
          {tab === "quiz" ? (
            <motion.div key="quiz"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
            >
              <QuizLeaderboard user={user} myPoints={myPoints} />
            </motion.div>
          ) : (
            <motion.div key="pronos"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
            >
              <PronosLeaderboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
