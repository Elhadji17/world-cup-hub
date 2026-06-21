// src/data/match-form.js
// Système de "forme du jour" — variance aléatoire par match, indépendante des stats de base.
// Rend chaque match différent même avec la même équipe, et récompense l'observation
// avant de lancer le coup d'envoi.

export const FORM_STATES = {
  on_fire: { id: "on_fire", emoji: "🔥", label: "En feu",  mult: 1.08 },
  flat:    { id: "flat",    emoji: "😴", label: "À plat",  mult: 0.92 },
};

// Tire 1 à 2 joueurs d'un effectif pour leur assigner une forme du jour.
// Retourne une map { playerId: formStateId } à fusionner avec l'équipe.
export function rollMatchForm(players) {
  if (!players || players.length === 0) return {};
  const formMap = {};
  const count = 1 + Math.floor(Math.random() * 2); // 1 ou 2 joueurs concernés
  const pool  = [...players];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx    = Math.floor(Math.random() * pool.length);
    const player = pool.splice(idx, 1)[0];
    const state  = Math.random() < 0.5 ? "on_fire" : "flat";
    formMap[player.id] = state;
  }
  return formMap;
}

// Applique le multiplicateur de forme aux stats offensives d'un joueur, si concerné
export function applyFormMultiplier(stats, player, formMap) {
  const formId = formMap?.[player.id];
  if (!formId) return stats;
  const form = FORM_STATES[formId];
  if (!form) return stats;

  return {
    ...stats,
    TIR: Math.round((stats.TIR ?? 60) * form.mult),
    PAC: Math.round((stats.PAC ?? 60) * form.mult),
    DRI: Math.round((stats.DRI ?? 60) * form.mult),
    PAS: Math.round((stats.PAS ?? 60) * form.mult),
  };
}
