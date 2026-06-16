// src/pages/Badges.jsx
// Page badges/trophées

import { useState, useEffect }       from "react";
import { motion, AnimatePresence }   from "framer-motion";
import { useAuth }                   from "../hooks/useAuth";
import { useGameStats }              from "../hooks/useGameStats.jsx";
import { BADGES, BADGE_CATEGORIES, getUnlockedBadges } from "../data/badges";

const COLLECTION_KEY = "wch_cards";
const TEAM_KEY       = "wch_team";
const API            = import.meta.env.VITE_API_URL ?? "";

function loadCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; }
  catch { return []; }
}

function loadTeam() {
  try { return JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}; }
  catch { return {}; }
}

export default function Badges() {
  const { user }                              = useAuth();
  const { coins, totalPoints, totalCoins }    = useGameStats();
  const [pronos,     setPronos]               = useState([]);
  const [quizStats,  setQuizStats]            = useState(null);
  const [selectedBadge, setSelectedBadge]     = useState(null);
  const [filter,     setFilter]               = useState("all");

  // Charger stats quiz depuis MongoDB
  useEffect(() => {
    const token = localStorage.getItem("wch_token");
    if (!token) return;
    fetch(`${API}/api/quiz?action=stats`, {
      headers: { "Authorization": `Bearer ${token}` },
    }).then(r => r.json()).then(setQuizStats).catch(() => {});

    fetch(`${API}/api/predictions/me`, {
      headers: { "Authorization": `Bearer ${token}` },
    }).then(r => r.json()).then(data => setPronos(data.predictions ?? [])).catch(() => {});
  }, [user]);

  // Calculer les stats pour les badges
  const collection    = loadCollection();
  const team          = loadTeam();
  const teamPositions = Object.values(team).filter(Boolean);
  const teamRating    = teamPositions.length > 0
    ? Math.round(teamPositions.reduce((s, p) => s + (p?.rating ?? 0), 0) / teamPositions.length)
    : 0;

  const exactScores = pronos.filter(p => p.points >= 15).length;

  const badgeStats = {
    quizPlayed:      quizStats?.quizPlayed    ?? 0,
    quizCorrect:     quizStats?.quizCorrect   ?? 0,
    bestStreak:      quizStats?.bestStreak    ?? 0,
    totalPoints:     totalPoints              ?? 0,
    totalCoins:      totalCoins               ?? 0,
    cardsCount:      collection.length,
    goldCards:       collection.filter(c => c.rarity === "gold").length,
    legendaryCards:  collection.filter(c => c.rarity === "legendary").length,
    teamFull:        teamPositions.length >= 11,
    teamRating,
    exactScores,
  };

  const unlocked   = getUnlockedBadges(badgeStats);
  const unlockedIds = new Set(unlocked.map(b => b.id));

  const filteredBadges = filter === "all"
    ? BADGES
    : filter === "unlocked"
      ? BADGES.filter(b => unlockedIds.has(b.id))
      : BADGES.filter(b => b.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-black to-purple-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🏅 Badges</h1>
            <p className="text-xs text-gray-400">
              {unlocked.length}/{BADGES.length} débloqués
            </p>
          </div>
          {/* Barre progression */}
          <div className="w-24">
            <div className="text-xs text-gray-400 text-right mb-1">{Math.round(unlocked.length / BADGES.length * 100)}%</div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlocked.length / BADGES.length) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* Résumé */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-black text-yellow-400">{unlocked.length}</div>
              <div className="text-xs text-gray-400">Débloqués</div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-500">{BADGES.length - unlocked.length}</div>
              <div className="text-xs text-gray-400">Restants</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-400">{Math.round(unlocked.length / BADGES.length * 100)}%</div>
              <div className="text-xs text-gray-400">Complété</div>
            </div>
          </div>
        </motion.div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {[
            { id: "all",      label: "Tous" },
            { id: "unlocked", label: "✅ Débloqués" },
            ...Object.entries(BADGE_CATEGORIES).map(([id, { label, emoji }]) => ({
              id, label: `${emoji} ${label}`
            })),
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                filter === id
                  ? "bg-yellow-500 text-black"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Grille badges */}
        <div className="grid grid-cols-2 gap-3">
          {filteredBadges.map((badge, i) => {
            const isUnlocked = unlockedIds.has(badge.id);
            return (
              <motion.div key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative rounded-2xl border p-4 cursor-pointer transition ${
                  isUnlocked
                    ? `bg-gradient-to-br ${badge.color} bg-opacity-30 ${badge.border}`
                    : "bg-white/5 border-white/10 opacity-50 grayscale"
                }`}
              >
                {/* Badge débloqué */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-black font-black">✓</span>
                  </div>
                )}

                <div className="text-4xl mb-2">{badge.emoji}</div>
                <div className="font-bold text-sm text-white">{badge.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{badge.desc}</div>

                {/* Catégorie */}
                <div className="mt-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  {BADGE_CATEGORIES[badge.category]?.emoji} {BADGE_CATEGORIES[badge.category]?.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-400">Aucun badge dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            >
              <div className={`rounded-2xl border p-6 text-center ${
                unlockedIds.has(selectedBadge.id)
                  ? `bg-gradient-to-br ${selectedBadge.color} ${selectedBadge.border}`
                  : "bg-gray-800 border-white/10"
              }`}>
                <div className="text-6xl mb-3">{selectedBadge.emoji}</div>
                <h3 className="text-xl font-black text-white mb-1">{selectedBadge.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{selectedBadge.desc}</p>

                {unlockedIds.has(selectedBadge.id) ? (
                  <div className="bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-2 text-green-300 text-sm font-bold">
                    ✅ Badge débloqué !
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-xl px-4 py-2 text-gray-400 text-sm">
                    🔒 Non débloqué
                  </div>
                )}

                <button onClick={() => setSelectedBadge(null)}
                  className="mt-4 text-xs text-gray-400 hover:text-white transition">
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
