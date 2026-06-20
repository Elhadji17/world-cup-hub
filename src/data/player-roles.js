// src/data/player-roles.js
// Système de rôles précis par position — module les stats effectives en match

export const ROLES = {
  ATT: [
    {
      id:    "avant_centre",
      name:  "Avant-centre",
      emoji: "🎯",
      desc:  "Pur finisseur, vit dans la surface",
      boost: { TIR: 1.15, PHY: 1.1, PAS: 0.85, DRI: 0.9 },
    },
    {
      id:    "faux_neuf",
      name:  "Faux 9",
      emoji: "🌀",
      desc:  "Décroche pour combiner, moins clinique",
      boost: { PAS: 1.15, DRI: 1.15, TIR: 0.9, PHY: 0.9 },
    },
  ],
  MIL: [
    {
      id:    "relayeur",
      name:  "Relayeur",
      emoji: "🔄",
      desc:  "Fait circuler le jeu, équilibré",
      boost: { PAS: 1.15, DRI: 1.1, DEF: 0.9 },
    },
    {
      id:    "recuperateur",
      name:  "Récupérateur",
      emoji: "🛡️",
      desc:  "Verrouille le milieu, protège la défense",
      boost: { DEF: 1.2, PHY: 1.15, PAS: 0.85, TIR: 0.8 },
    },
  ],
  DEF: [
    {
      id:    "defenseur_central",
      name:  "Défenseur central",
      emoji: "🧱",
      desc:  "Mur défensif, pur arrêt",
      boost: { DEF: 1.2, PHY: 1.15, PAC: 0.9 },
    },
    {
      id:    "lateral_offensif",
      name:  "Latéral offensif",
      emoji: "🏃",
      desc:  "Monte sur le côté, soutient l'attaque",
      boost: { PAC: 1.2, PAS: 1.1, DEF: 0.85 },
    },
  ],
  GK: [
    {
      id:    "gardien_classique",
      name:  "Gardien classique",
      emoji: "🧤",
      desc:  "Solide entre les poteaux",
      boost: { DEF: 1.15, PHY: 1.05 },
    },
    {
      id:    "gardien_libero",
      name:  "Gardien libéro",
      emoji: "⚡",
      desc:  "Relance vite, joue avec les pieds",
      boost: { PAS: 1.25, DEF: 0.95 },
    },
  ],
};

// Détermine le rôle par défaut d'un joueur selon ses deux meilleures stats pertinentes
export function getDefaultRole(player) {
  const position = player.position ?? "MIL";
  const roles = ROLES[position] ?? ROLES.MIL;
  const stats = player.stats ?? {};

  if (position === "ATT") {
    // Avant-centre si TIR+PHY > PAS+DRI, sinon Faux 9
    const finisher = (stats.TIR ?? 0) + (stats.PHY ?? 0);
    const creator  = (stats.PAS ?? 0) + (stats.DRI ?? 0);
    return finisher >= creator ? roles[0] : roles[1];
  }
  if (position === "MIL") {
    const creator = (stats.PAS ?? 0) + (stats.DRI ?? 0);
    const destroyer = (stats.DEF ?? 0) + (stats.PHY ?? 0);
    return creator >= destroyer ? roles[0] : roles[1];
  }
  if (position === "DEF") {
    const stopper = (stats.DEF ?? 0) + (stats.PHY ?? 0);
    const attacker = (stats.PAC ?? 0) + (stats.PAS ?? 0);
    return stopper >= attacker ? roles[0] : roles[1];
  }
  // GK
  const classic = (stats.DEF ?? 0);
  const sweeper  = (stats.PAS ?? 0);
  return classic >= sweeper ? roles[0] : roles[1];
}

// Récupère un rôle par son id et la position du joueur
export function getRoleById(position, roleId) {
  const roles = ROLES[position] ?? ROLES.MIL;
  return roles.find(r => r.id === roleId) ?? roles[0];
}

// Applique le boost du rôle aux stats d'un joueur — retourne des stats ajustées
export function applyRoleBoost(player, roleId) {
  const position = player.position ?? "MIL";
  const role = getRoleById(position, roleId);
  const stats = player.stats ?? {};
  const boosted = {};
  for (const key of ["PAC", "TIR", "PAS", "DRI", "DEF", "PHY"]) {
    const mult = role.boost[key] ?? 1;
    boosted[key] = Math.round((stats[key] ?? 60) * mult);
  }
  return boosted;
}
