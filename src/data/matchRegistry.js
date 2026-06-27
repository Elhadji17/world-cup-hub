// src/data/matchRegistry.js
// Liste de tous les matchs disponibles dans le simulateur.
// dataLevel: "full" = fichier dédié, "auto" = généré automatiquement
// fifaRating: note FIFA de l'équipe (utilisée par le générateur automatique)

export const MATCH_REGISTRY = [
  // ── Matchs Sénégal (données complètes) ─────────────────────────────────
  {
    id:         "sen_nor_2026",
    homeTeam:   { name: "Sénégal",  flag: "🇸🇳", fifaRating: 81 },
    awayTeam:   { name: "Norvège",  flag: "🇳🇴", fifaRating: 84 },
    group:      "Groupe I · 2e journée",
    stadium:    "MetLife Stadium, New Jersey",
    date:       "22 juin 2026",
    status:     "finished",
    dataLevel:  "full",
    context:    "normal",
  },
  {
    id:         "sen_ira_2026",
    homeTeam:   { name: "Sénégal", flag: "🇸🇳", fifaRating: 81 },
    awayTeam:   { name: "Irak",    flag: "🇮🇶", fifaRating: 68 },
    group:      "Groupe I · 3e journée",
    stadium:    "BMO Field, Toronto",
    date:       "26 juin 2026",
    status:     "upcoming",
    dataLevel:  "full",
    context:    "must_win",
  },

  // ── Autres gros matchs (générés automatiquement) ────────────────────────
  {
    id:         "fra_arg_2026",
    homeTeam:   { name: "France",    flag: "🇫🇷", fifaRating: 92 },
    awayTeam:   { name: "Argentine", flag: "🇦🇷", fifaRating: 91 },
    group:      "Choc de la compétition",
    stadium:    "SoFi Stadium, Los Angeles",
    date:       "À venir",
    status:     "upcoming",
    dataLevel:  "auto",
    context:    "normal",
  },
  {
    id:         "esp_bre_2026",
    homeTeam:   { name: "Espagne", flag: "🇪🇸", fifaRating: 88 },
    awayTeam:   { name: "Brésil",  flag: "🇧🇷", fifaRating: 89 },
    group:      "Choc des titans",
    stadium:    "MetLife Stadium, New Jersey",
    date:       "À venir",
    status:     "upcoming",
    dataLevel:  "auto",
    context:    "normal",
  },
  {
    id:         "eng_ger_2026",
    homeTeam:   { name: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRating: 85 },
    awayTeam:   { name: "Allemagne",  flag: "🇩🇪", fifaRating: 84 },
    group:      "Choc européen",
    stadium:    "AT&T Stadium, Dallas",
    date:       "À venir",
    status:     "upcoming",
    dataLevel:  "auto",
    context:    "normal",
  },
  {
    id:         "por_bel_2026",
    homeTeam:   { name: "Portugal", flag: "🇵🇹", fifaRating: 86 },
    awayTeam:   { name: "Belgique", flag: "🇧🇪", fifaRating: 83 },
    group:      "Duel ibérico-belge",
    stadium:    "Levi's Stadium, San Francisco",
    date:       "À venir",
    status:     "upcoming",
    dataLevel:  "auto",
    context:    "normal",
  },
];

export function getUpcomingMatches() {
  return MATCH_REGISTRY.filter(m => m.status === "upcoming");
}

export function getAllMatches() {
  return MATCH_REGISTRY;
}
