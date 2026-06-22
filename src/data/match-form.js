// src/data/match-form.js
// Système de forme — deux modes :
// 1. Forme du jour aléatoire (matchs avec cartes perso)
// 2. Forme réelle basée sur recentForm (simulateur de vrais matchs)

export const FORM_STATES = {
  on_fire: { id: "on_fire", emoji: "🔥", label: "En feu",  mult: 1.08 },
  flat:    { id: "flat",    emoji: "😴", label: "À plat",  mult: 0.92 },
};

// Tire 1 à 2 joueurs d'un effectif pour leur assigner une forme du jour aléatoire.
// Utilisé par les matchs avec cartes personnelles.
export function rollMatchForm(players) {
  if (!players || players.length === 0) return {};
  const formMap = {};
  const count = 1 + Math.floor(Math.random() * 2);
  const pool  = [...players];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx    = Math.floor(Math.random() * pool.length);
    const player = pool.splice(idx, 1)[0];
    const state  = Math.random() < 0.5 ? "on_fire" : "flat";
    formMap[player.id] = state;
  }
  return formMap;
}

// Calcule le multiplicateur de forme d'un joueur selon sa forme récente (5 derniers matchs).
// Pivot à 7.0 — au-dessus = bonus, en-dessous = malus.
// Si pas de recentForm, retourne 1.0 (neutre).
export function getRecentFormMultiplier(player) {
  if (!player || !player.recentForm || player.recentForm.length === 0) return 1.0;
  const avg = player.recentForm.reduce((a, b) => a + b, 0) / player.recentForm.length;
  // +/- 10% max selon la forme (7.0 = neutre, 8.0 = +10%, 6.0 = -10%)
  return Math.min(1.15, Math.max(0.85, 1.0 + (avg - 7.0) * 0.10));
}

// Applique le multiplicateur de forme aux stats d'un joueur.
// Prend en compte soit la forme aléatoire (formMap), soit la forme réelle (recentForm).
// La forme réelle prend la priorité si elle est présente sur le joueur.
export function applyFormMultiplier(stats, player, formMap) {
  let mult = 1.0;

  if (player.recentForm && player.recentForm.length > 0) {
    // Mode simulateur de vrais matchs — forme basée sur les 5 derniers matchs réels
    mult = getRecentFormMultiplier(player);
  } else {
    // Mode matchs avec cartes perso — forme aléatoire du jour
    const formId = formMap?.[player.id];
    if (!formId) return stats;
    const form = FORM_STATES[formId];
    if (!form) return stats;
    mult = form.mult;
  }

  if (mult === 1.0) return stats;

  return {
    ...stats,
    TIR: Math.round((stats.TIR ?? 60) * mult),
    PAC: Math.round((stats.PAC ?? 60) * mult),
    DRI: Math.round((stats.DRI ?? 60) * mult),
    PAS: Math.round((stats.PAS ?? 60) * mult),
    DEF: Math.round((stats.DEF ?? 60) * mult), // la forme affecte aussi la défense
    PHY: Math.round((stats.PHY ?? 60) * mult),
  };
}
