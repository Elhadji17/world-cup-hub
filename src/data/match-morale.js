// src/data/match-morale.js
// Système de moral d'équipe — crée un vrai momentum sur plusieurs matchs.
// Stocké en localStorage (pas besoin de backend, c'est par appareil).
// Chaque victoire monte le moral, chaque défaite le baisse. Le moral
// affecte les stats offensives ET défensives du prochain match.

const MORALE_KEY = "wch_morale";
const MAX_MORALE = 5;
const MIN_MORALE = 1;

export const MORALE_LEVELS = {
  5: { label: "Invincible",  emoji: "🔥", color: "text-orange-400", attBonus: 1.12, defBonus: 1.08 },
  4: { label: "Confiant",    emoji: "😤", color: "text-green-400",  attBonus: 1.06, defBonus: 1.04 },
  3: { label: "Neutre",      emoji: "😐", color: "text-gray-400",   attBonus: 1.0,  defBonus: 1.0  },
  2: { label: "Incertain",   emoji: "😟", color: "text-yellow-400", attBonus: 0.94, defBonus: 0.96 },
  1: { label: "En crise",    emoji: "😰", color: "text-red-400",    attBonus: 0.88, defBonus: 0.92 },
};

// Charger le moral actuel (défaut : 3 = neutre)
export function getMorale() {
  try {
    const val = parseInt(localStorage.getItem(MORALE_KEY) ?? "3");
    return Math.min(MAX_MORALE, Math.max(MIN_MORALE, val));
  } catch {
    return 3;
  }
}

// Mettre à jour le moral après un match
export function updateMorale(result) {
  const current = getMorale();
  let next = current;
  if (result === "win")  next = Math.min(MAX_MORALE, current + 1);
  if (result === "loss") next = Math.max(MIN_MORALE, current - 1);
  // Nul : aucun changement
  localStorage.setItem(MORALE_KEY, String(next));
  return next;
}

// Retourne les infos du niveau de moral actuel
export function getMoraleInfo(moraleLevel) {
  return MORALE_LEVELS[moraleLevel] ?? MORALE_LEVELS[3];
}
