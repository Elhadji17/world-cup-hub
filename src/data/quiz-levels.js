// src/data/quiz-levels.js
// Système de niveaux par catégorie

export const LEVELS = [
  { level: 1, label: "Débutant",   emoji: "⭐",          range: [0,  10], color: "text-gray-400",   bg: "from-gray-600 to-gray-800"     },
  { level: 2, label: "Confirmé",   emoji: "⭐⭐",        range: [10, 20], color: "text-blue-400",   bg: "from-blue-600 to-blue-800"     },
  { level: 3, label: "Expert",     emoji: "⭐⭐⭐",      range: [20, 30], color: "text-green-400",  bg: "from-green-600 to-green-800"   },
  { level: 4, label: "Champion",   emoji: "⭐⭐⭐⭐",    range: [30, 40], color: "text-yellow-400", bg: "from-yellow-600 to-amber-700"  },
  { level: 5, label: "Légendaire", emoji: "👑",           range: [40, 50], color: "text-purple-400", bg: "from-purple-600 to-purple-800" },
];

export const QUESTIONS_PER_LEVEL = 10;

// Obtenir le niveau actuel d'une catégorie
export function getCategoryLevel(catId) {
  const seen = JSON.parse(localStorage.getItem(`wch_seen_${catId}`)) ?? [];
  const seenCount = seen.length;
  const levelIndex = Math.min(Math.floor(seenCount / QUESTIONS_PER_LEVEL), LEVELS.length - 1);
  return LEVELS[levelIndex];
}

// Obtenir les questions du niveau actuel
export function getLevelQuestions(allQ, catId) {
  const seen = JSON.parse(localStorage.getItem(`wch_seen_${catId}`)) ?? [];
  const seenCount = seen.length;
  const levelIndex = Math.floor(seenCount / QUESTIONS_PER_LEVEL);

  if (levelIndex >= LEVELS.length) {
    // Tous les niveaux terminés → reset
    localStorage.removeItem(`wch_seen_${catId}`);
    return allQ.slice(0, QUESTIONS_PER_LEVEL);
  }

  const level = LEVELS[levelIndex];
  const [start, end] = level.range;
  
  // Questions de ce niveau non encore vues
  const levelQ = allQ.slice(start, end);
  const unseen  = levelQ.filter(q => !seen.includes(q.id));
  
  return unseen.length > 0 ? unseen : levelQ;
}

// Vérifier si un niveau est terminé
export function isLevelDone(catId, levelIndex) {
  const seen = JSON.parse(localStorage.getItem(`wch_seen_${catId}`)) ?? [];
  const level = LEVELS[levelIndex];
  if (!level) return false;
  const [start, end] = level.range;
  return seen.length >= end;
}

// Obtenir la progression totale
export function getCategoryProgress(catId, totalQ) {
  const seen = JSON.parse(localStorage.getItem(`wch_seen_${catId}`)) ?? [];
  return {
    seen:    seen.length,
    total:   totalQ,
    pct:     Math.round((seen.length / totalQ) * 100),
    level:   Math.min(Math.floor(seen.length / QUESTIONS_PER_LEVEL) + 1, LEVELS.length),
  };
}
