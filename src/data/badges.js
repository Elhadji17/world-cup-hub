// src/data/badges.js
// Définition de tous les badges/trophées

export const BADGES = [
  // ── Quiz ──────────────────────────────────────────────────────────────────
  {
    id:       "first_game",
    emoji:    "🎮",
    title:    "Premier pas",
    desc:     "Joue ta première partie de Quiz",
    category: "quiz",
    color:    "from-blue-600 to-blue-800",
    border:   "border-blue-400/40",
    check:    ({ quizPlayed }) => quizPlayed >= 1,
  },
  {
    id:       "streak_5",
    emoji:    "🔥",
    title:    "En feu !",
    desc:     "Réalise une série de 5 bonnes réponses",
    category: "quiz",
    color:    "from-orange-600 to-red-700",
    border:   "border-orange-400/40",
    check:    ({ bestStreak }) => bestStreak >= 5,
  },
  {
    id:       "streak_10",
    emoji:    "⚡",
    title:    "Éclair",
    desc:     "Réalise une série de 10 bonnes réponses",
    category: "quiz",
    color:    "from-yellow-500 to-orange-600",
    border:   "border-yellow-400/40",
    check:    ({ bestStreak }) => bestStreak >= 10,
  },
  {
    id:       "correct_50",
    emoji:    "🎯",
    title:    "Tireur d'élite",
    desc:     "Réponds correctement à 50 questions",
    category: "quiz",
    color:    "from-green-600 to-emerald-800",
    border:   "border-green-400/40",
    check:    ({ quizCorrect }) => quizCorrect >= 50,
  },
  {
    id:       "points_500",
    emoji:    "👑",
    title:    "Quiz Master",
    desc:     "Atteins 500 points au classement Quiz",
    category: "quiz",
    color:    "from-purple-600 to-purple-800",
    border:   "border-purple-400/40",
    check:    ({ totalPoints }) => totalPoints >= 500,
  },
  {
    id:       "points_2000",
    emoji:    "🏆",
    title:    "Légende du Quiz",
    desc:     "Atteins 2000 points au classement Quiz",
    category: "quiz",
    color:    "from-yellow-600 to-amber-700",
    border:   "border-yellow-300/60",
    check:    ({ totalPoints }) => totalPoints >= 2000,
  },

  // ── Coins ─────────────────────────────────────────────────────────────────
  {
    id:       "coins_500",
    emoji:    "💰",
    title:    "Riche !",
    desc:     "Accumule 500 coins au total",
    category: "coins",
    color:    "from-yellow-600 to-amber-700",
    border:   "border-yellow-400/40",
    check:    ({ totalCoins }) => totalCoins >= 500,
  },
  {
    id:       "coins_2000",
    emoji:    "🤑",
    title:    "Millionnaire",
    desc:     "Accumule 2000 coins au total",
    category: "coins",
    color:    "from-yellow-500 to-yellow-700",
    border:   "border-yellow-300/60",
    check:    ({ totalCoins }) => totalCoins >= 2000,
  },

  // ── Cartes ────────────────────────────────────────────────────────────────
  {
    id:       "cards_10",
    emoji:    "🃏",
    title:    "Collectionneur",
    desc:     "Obtiens 10 cartes",
    category: "cartes",
    color:    "from-indigo-600 to-purple-700",
    border:   "border-indigo-400/40",
    check:    ({ cardsCount }) => cardsCount >= 10,
  },
  {
    id:       "gold_card",
    emoji:    "🟨",
    title:    "Chasseur d'Or",
    desc:     "Obtiens ta première carte Or",
    category: "cartes",
    color:    "from-yellow-600 to-amber-600",
    border:   "border-yellow-400/40",
    check:    ({ goldCards }) => goldCards >= 1,
  },
  {
    id:       "legendary_card",
    emoji:    "💎",
    title:    "Légendaire",
    desc:     "Obtiens une carte Légendaire",
    category: "cartes",
    color:    "from-purple-700 to-pink-700",
    border:   "border-purple-300/60",
    check:    ({ legendaryCards }) => legendaryCards >= 1,
  },

  // ── Équipe ────────────────────────────────────────────────────────────────
  {
    id:       "team_full",
    emoji:    "⚽",
    title:    "Coach",
    desc:     "Complète ton équipe avec 11 joueurs",
    category: "equipe",
    color:    "from-green-600 to-green-800",
    border:   "border-green-400/40",
    check:    ({ teamFull }) => teamFull,
  },
  {
    id:       "team_85",
    emoji:    "🌟",
    title:    "Dream Team",
    desc:     "Atteins une note d'équipe supérieure à 85",
    category: "equipe",
    color:    "from-cyan-600 to-blue-700",
    border:   "border-cyan-400/40",
    check:    ({ teamRating }) => teamRating >= 85,
  },

  // ── Pronostics ────────────────────────────────────────────────────────────
  {
    id:       "first_prono",
    emoji:    "🔮",
    title:    "Prophète",
    desc:     "Fais ton premier pronostic exact",
    category: "pronostics",
    color:    "from-violet-600 to-purple-800",
    border:   "border-violet-400/40",
    check:    ({ exactScores }) => exactScores >= 1,
  },
  {
    id:       "prono_5",
    emoji:    "🎱",
    title:    "Oracle",
    desc:     "Réalise 5 pronostics exacts",
    category: "pronostics",
    color:    "from-violet-700 to-indigo-800",
    border:   "border-violet-300/60",
    check:    ({ exactScores }) => exactScores >= 5,
  },
];

export const BADGE_CATEGORIES = {
  quiz:       { label: "Quiz",       emoji: "🧠" },
  coins:      { label: "Coins",      emoji: "💰" },
  cartes:     { label: "Cartes",     emoji: "🃏" },
  equipe:     { label: "Équipe",     emoji: "⚽" },
  pronostics: { label: "Pronostics", emoji: "🔮" },
};

// Calculer les badges débloqués
export function getUnlockedBadges(stats) {
  return BADGES.filter(b => {
    try { return b.check(stats); }
    catch { return false; }
  });
}
