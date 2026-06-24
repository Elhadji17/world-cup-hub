// src/data/matchRegistry.js
// Liste de tous les matchs disponibles dans le simulateur.
// Chaque match référence son fichier de données dédié.
// dataLevel: "full" = données complètes, "generic" = notes FIFA uniquement

export const MATCH_REGISTRY = [
  {
    id:         "sen_nor_2026",
    homeTeam:   { name: "Sénégal",  flag: "🇸🇳", fifaRank: 15 },
    awayTeam:   { name: "Norvège",  flag: "🇳🇴", fifaRank: 31 },
    group:      "Groupe I · 2e journée",
    stadium:    "MetLife Stadium, New Jersey",
    date:       "22 juin 2026",
    status:     "finished", // upcoming | live | finished
    dataLevel:  "full",
    userSide:   "home",
    dataFile:   "sen_nor_2026",
  },
  {
    id:         "sen_ira_2026",
    homeTeam:   { name: "Sénégal", flag: "🇸🇳", fifaRank: 15 },
    awayTeam:   { name: "Irak",    flag: "🇮🇶", fifaRank: 68 },
    group:      "Groupe I · 3e journée",
    stadium:    "BMO Field, Toronto",
    date:       "26 juin 2026",
    status:     "upcoming",
    dataLevel:  "full",
    userSide:   "home",
    dataFile:   "sen_ira_2026",
  },
];

// Retourne les matchs à venir triés par date
export function getUpcomingMatches() {
  return MATCH_REGISTRY.filter(m => m.status === "upcoming");
}

// Retourne tous les matchs (y compris terminés)
export function getAllMatches() {
  return MATCH_REGISTRY;
}

// Charge dynamiquement les données d'un match
export async function loadMatchData(dataFile) {
  try {
    const module = await import(`./matches/${dataFile}.js`);
    return module;
  } catch {
    return null;
  }
}
