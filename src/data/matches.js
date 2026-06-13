// Matchs réels de la Coupe du Monde 2026
// Source : calendrier officiel FIFA (Canada, USA, Mexique)
// Groupes A à L — 48 équipes, 104 matchs

// matches.js // Matchs réels de la Coupe du Monde 2026 
// Source : calendrier officiel FIFA (Canada, USA, Mexique)
// Groupes A à L — 48 équipes, 104 matchs

import { getMatchStatus } from "../utils/dateUtils";
export const GROUPS = {
  A: ["Mexique", "Afrique du Sud", "Corée du Sud", "Tchéquie"],
  B: ["Canada", "Bosnie-et-Herzégovine", "Qatar", "Suisse"],
  C: ["Brésil", "Maroc", "Haïti", "Écosse"],
  D: ["États-Unis", "Paraguay", "Australie", "Turquie"],
  E: ["Allemagne", "Curaçao", "Côte d'Ivoire", "Équateur"],
  F: ["Pays-Bas", "Japon", "Suède", "Tunisie"],
  G: ["Belgique", "Égypte", "Iran", "Nouvelle-Zélande"],
  H: ["Espagne", "Cap-Vert", "Arabie Saoudite", "Uruguay"],
  I: ["France", "Sénégal", "Irak", "Norvège"],
  J: ["Argentine", "Algérie", "Autriche", "Jordanie"],
  K: ["Portugal", "RD Congo", "Ouzbékistan", "Colombie"],
  L: ["Angleterre", "Croatie", "Ghana", "Panama"],
};

export const FLAGS = {
  "Mexique": "🇲🇽",
  "Afrique du Sud": "🇿🇦",
  "Corée du Sud": "🇰🇷",
  "Tchéquie": "🇨🇿",
  "Canada": "🇨🇦",
  "Bosnie-et-Herzégovine": "🇧🇦",
  "Qatar": "🇶🇦",
  "Suisse": "🇨🇭",
  "Brésil": "🇧🇷",
  "Maroc": "🇲🇦",
  "Haïti": "🇭🇹",
  "Écosse": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "États-Unis": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australie": "🇦🇺",
  "Turquie": "🇹🇷",
  "Allemagne": "🇩🇪",
  "Curaçao": "🇨🇼",
  "Côte d'Ivoire": "🇨🇮",
  "Équateur": "🇪🇨",
  "Pays-Bas": "🇳🇱",
  "Japon": "🇯🇵",
  "Suède": "🇸🇪",
  "Tunisie": "🇹🇳",
  "Belgique": "🇧🇪",
  "Égypte": "🇪🇬",
  "Iran": "🇮🇷",
  "Nouvelle-Zélande": "🇳🇿",
  "Espagne": "🇪🇸",
  "Cap-Vert": "🇨🇻",
  "Arabie Saoudite": "🇸🇦",
  "Uruguay": "🇺🇾",
  "France": "🇫🇷",
  "Sénégal": "🇸🇳",
  "Irak": "🇮🇶",
  "Norvège": "🇳🇴",
  "Argentine": "🇦🇷",
  "Algérie": "🇩🇿",
  "Autriche": "🇦🇹",
  "Jordanie": "🇯🇴",
  "Portugal": "🇵🇹",
  "RD Congo": "🇨🇩",
  "Ouzbékistan": "🇺🇿",
  "Colombie": "🇨🇴",
  "Angleterre": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croatie": "🇭🇷",
  "Ghana": "🇬🇭",
  "Panama": "🇵🇦"
};

export const MATCHES = [
  // GROUPE A
  { id: 1, group: "A", teamA: "Mexique",        teamB: "Afrique du Sud", date: "2026-06-11", time: "13:00", stadium: "Mexico City",   status: "upcoming" },
  { id: 2, group: "A", teamA: "Corée du Sud",    teamB: "Tchéquie",       date: "2026-06-11", time: "20:00", stadium: "Guadalajara",   status: "upcoming" },
  { id: 3, group: "A", teamA: "Mexique",        teamB: "Corée du Sud",    date: "2026-06-17", time: "16:00", stadium: "Atlanta",       status: "upcoming" },
  { id: 4, group: "A", teamA: "Tchéquie",       teamB: "Afrique du Sud", date: "2026-06-18", time: "11:00", stadium: "Monterrey",     status: "upcoming" },
  { id: 5, group: "A", teamA: "Tchéquie",       teamB: "Mexique",        date: "2026-06-24", time: "16:00", stadium: "Mexico City",   status: "upcoming" },
  { id: 6, group: "A", teamA: "Afrique du Sud", teamB: "Corée du Sud",    date: "2026-06-24", time: "16:00", stadium: "Monterrey",     status: "upcoming" },

  // GROUPE B
  { id: 7,  group: "B", teamA: "Canada",                teamB: "Bosnie-et-Herzégovine", date: "2026-06-12", time: "15:00", stadium: "Toronto",    status: "upcoming" },
  { id: 8,  group: "B", teamA: "Qatar",                 teamB: "Suisse",                date: "2026-06-13", time: "12:00", stadium: "San Francisco", status: "upcoming" },
  { id: 9,  group: "B", teamA: "Canada",                teamB: "Qatar",                 date: "2026-06-18", time: "21:00", stadium: "Vancouver",  status: "upcoming" },
  { id: 10, group: "B", teamA: "Suisse",                teamB: "Bosnie-et-Herzégovine", date: "2026-06-18", time: "14:00", stadium: "Boston",     status: "upcoming" },
  { id: 11, group: "B", teamA: "Suisse",                teamB: "Canada",                date: "2026-06-24", time: "19:00", stadium: "Vancouver",  status: "upcoming" },
  { id: 12, group: "B", teamA: "Bosnie-et-Herzégovine", teamB: "Qatar",                 date: "2026-06-24", time: "19:00", stadium: "Toronto",    status: "upcoming" },

  // GROUPE C
  { id: 13, group: "C", teamA: "Brésil", teamB: "Maroc",   date: "2026-06-13", time: "18:00", stadium: "New York", status: "upcoming" },
  { id: 14, group: "C", teamA: "Haïti",  teamB: "Écosse",  date: "2026-06-13", time: "21:00", stadium: "Boston",   status: "upcoming" },
  { id: 15, group: "C", teamA: "Brésil", teamB: "Haïti",   date: "2026-06-19", time: "19:00", stadium: "Orlando",  status: "upcoming" },
  { id: 16, group: "C", teamA: "Écosse", teamB: "Maroc",   date: "2026-06-19", time: "13:00", stadium: "Miami",    status: "upcoming" },
  { id: 17, group: "C", teamA: "Écosse", teamB: "Brésil",  date: "2026-06-24", time: "21:00", stadium: "Miami",    status: "upcoming" },
  { id: 18, group: "C", teamA: "Maroc",  teamB: "Haïti",   date: "2026-06-24", time: "21:00", stadium: "Orlando",  status: "upcoming" },

  // GROUPE D
  { id: 19, group: "D", teamA: "États-Unis", teamB: "Paraguay",  date: "2026-06-12", time: "18:00", stadium: "Los Angeles",   status: "upcoming" },
  { id: 20, group: "D", teamA: "Australie",  teamB: "Turquie",   date: "2026-06-13", time: "21:00", stadium: "Vancouver",     status: "upcoming" },
  { id: 21, group: "D", teamA: "États-Unis", teamB: "Australie", date: "2026-06-19", time: "19:00", stadium: "Seattle",       status: "upcoming" },
  { id: 22, group: "D", teamA: "Turquie",    teamB: "Paraguay",  date: "2026-06-19", time: "15:00", stadium: "San Francisco", status: "upcoming" },
  { id: 23, group: "D", teamA: "Turquie",    teamB: "États-Unis", date: "2026-06-25", time: "19:00", stadium: "Los Angeles",   status: "upcoming" },
  { id: 24, group: "D", teamA: "Paraguay",   teamB: "Australie", date: "2026-06-25", time: "19:00", stadium: "Miami",         status: "upcoming" },
   // GROUPE E
  { id: 25, group: "E", teamA: "Allemagne",     teamB: "Curaçao",       date: "2026-06-14", time: "12:00", stadium: "Houston",      status: "upcoming" },
  { id: 26, group: "E", teamA: "Côte d'Ivoire", teamB: "Équateur",      date: "2026-06-14", time: "19:00", stadium: "Philadelphia", status: "upcoming" },
  { id: 27, group: "E", teamA: "Allemagne",     teamB: "Côte d'Ivoire", date: "2026-06-20", time: "11:00", stadium: "New York",     status: "upcoming" },
  { id: 28, group: "E", teamA: "Équateur",      teamB: "Curaçao",       date: "2026-06-20", time: "15:00", stadium: "Boston",       status: "upcoming" },
  { id: 29, group: "E", teamA: "Équateur",      teamB: "Allemagne",     date: "2026-06-25", time: "13:00", stadium: "Philadelphia", status: "upcoming" },
  { id: 30, group: "E", teamA: "Curaçao",       teamB: "Côte d'Ivoire", date: "2026-06-25", time: "13:00", stadium: "Boston",       status: "upcoming" },

  // GROUPE F
  { id: 31, group: "F", teamA: "Pays-Bas", teamB: "Japon",   date: "2026-06-14", time: "15:00", stadium: "Dallas",     status: "upcoming" },
  { id: 32, group: "F", teamA: "Suède",    teamB: "Tunisie", date: "2026-06-14", time: "20:00", stadium: "Monterrey",  status: "upcoming" },
  { id: 33, group: "F", teamA: "Pays-Bas", teamB: "Suède",    date: "2026-06-20", time: "18:00", stadium: "Kansas City", status: "upcoming" },
  { id: 34, group: "F", teamA: "Tunisie",  teamB: "Japon",   date: "2026-06-20", time: "21:00", stadium: "Dallas",     status: "upcoming" },
  { id: 35, group: "F", teamA: "Tunisie",  teamB: "Pays-Bas", date: "2026-06-25", time: "16:00", stadium: "Atlanta",    status: "upcoming" },
  { id: 36, group: "F", teamA: "Japon",    teamB: "Suède",    date: "2026-06-25", time: "16:00", stadium: "Monterrey",  status: "upcoming" },

  // GROUPE G
  { id: 37, group: "G", teamA: "Belgique",         teamB: "Égypte",          date: "2026-06-15", time: "12:00", stadium: "Seattle",     status: "upcoming" },
  { id: 38, group: "G", teamA: "Iran",             teamB: "Nouvelle-Zélande", date: "2026-06-15", time: "18:00", stadium: "Los Angeles", status: "upcoming" },
  { id: 39, group: "G", teamA: "Belgique",         teamB: "Iran",            date: "2026-06-21", time: "12:00", stadium: "Vancouver",   status: "upcoming" },
  { id: 40, group: "G", teamA: "Nouvelle-Zélande", teamB: "Égypte",          date: "2026-06-21", time: "15:00", stadium: "Seattle",     status: "upcoming" },
  { id: 41, group: "G", teamA: "Nouvelle-Zélande", teamB: "Belgique",         date: "2026-06-26", time: "16:00", stadium: "Vancouver",   status: "upcoming" },
  { id: 42, group: "G", teamA: "Égypte",           teamB: "Iran",            date: "2026-06-26", time: "16:00", stadium: "Seattle",     status: "upcoming" },

  // GROUPE H
  { id: 43, group: "H", teamA: "Espagne",         teamB: "Cap-Vert",        date: "2026-06-15", time: "12:00", stadium: "Atlanta", status: "upcoming" },
  { id: 44, group: "H", teamA: "Arabie Saoudite", teamB: "Uruguay",         date: "2026-06-15", time: "18:00", stadium: "Miami",   status: "upcoming" },
  { id: 45, group: "H", teamA: "Espagne",         teamB: "Arabie Saoudite", date: "2026-06-21", time: "18:00", stadium: "Miami",   status: "upcoming" },
  { id: 46, group: "H", teamA: "Uruguay",         teamB: "Cap-Vert",        date: "2026-06-21", time: "21:00", stadium: "Atlanta", status: "upcoming" },
  { id: 47, group: "H", teamA: "Uruguay",         teamB: "Espagne",         date: "2026-06-26", time: "19:00", stadium: "Miami",   status: "upcoming" },
  { id: 48, group: "H", teamA: "Cap-Vert",        teamB: "Arabie Saoudite", date: "2026-06-26", time: "19:00", stadium: "Atlanta", status: "upcoming" },

  // GROUPE I
  { id: 49, group: "I", teamA: "France",  teamB: "Sénégal", date: "2026-06-16", time: "15:00", stadium: "New York", status: "upcoming" },
  { id: 50, group: "I", teamA: "Irak",    teamB: "Norvège", date: "2026-06-16", time: "18:00", stadium: "Boston",   status: "upcoming" },
  { id: 51, group: "I", teamA: "France",  teamB: "Irak",    date: "2026-06-22", time: "12:00", stadium: "Dallas",   status: "upcoming" },
  { id: 52, group: "I", teamA: "Norvège", teamB: "Sénégal", date: "2026-06-22", time: "15:00", stadium: "New York", status: "upcoming" },
  { id: 53, group: "I", teamA: "Norvège", teamB: "France",  date: "2026-06-27", time: "16:00", stadium: "New York", status: "upcoming" },
  { id: 54, group: "I", teamA: "Sénégal", teamB: "Irak",    date: "2026-06-27", time: "16:00", stadium: "Boston",   status: "upcoming" },

  // GROUPE J
  { id: 55, group: "J", teamA: "Argentine", teamB: "Algérie",  date: "2026-06-16", time: "20:00", stadium: "Kansas City",   status: "upcoming" },
  { id: 56, group: "J", teamA: "Autriche",  teamB: "Jordanie", date: "2026-06-16", time: "21:00", stadium: "San Francisco", status: "upcoming" },
  { id: 57, group: "J", teamA: "Argentine", teamB: "Autriche",  date: "2026-06-22", time: "18:00", stadium: "Dallas",        status: "upcoming" },
  { id: 58, group: "J", teamA: "Jordanie",  teamB: "Algérie",  date: "2026-06-22", time: "21:00", stadium: "Kansas City",   status: "upcoming" },
  { id: 59, group: "J", teamA: "Jordanie",  teamB: "Argentine", date: "2026-06-27", time: "19:00", stadium: "Miami",         status: "upcoming" },
  { id: 60, group: "J", teamA: "Algérie",  teamB: "Autriche",  date: "2026-06-27", time: "19:00", stadium: "Kansas City",   status: "upcoming" },

  // GROUPE K
  { id: 61, group: "K", teamA: "Portugal",   teamB: "RD Congo",    date: "2026-06-17", time: "12:00", stadium: "New York",   status: "upcoming" },
  { id: 62, group: "K", teamA: "Ouzbékistan", teamB: "Colombie",    date: "2026-06-17", time: "15:00", stadium: "Houston",    status: "upcoming" },
  { id: 63, group: "K", teamA: "Portugal",   teamB: "Ouzbékistan", date: "2026-06-22", time: "18:00", stadium: "Philadelphia",status: "upcoming" },
  { id: 64, group: "K", teamA: "Colombie",    teamB: "RD Congo",    date: "2026-06-23", time: "11:00", stadium: "Boston",       status: "upcoming" },
  { id: 65, group: "K", teamA: "Colombie",    teamB: "Portugal",   date: "2026-06-27", time: "13:00", stadium: "New York",   status: "upcoming" },
  { id: 66, group: "K", teamA: "RD Congo",    teamB: "Ouzbékistan", date: "2026-06-27", time: "13:00", stadium: "Philadelphia",status: "upcoming" },

  // GROUPE L
  { id: 67, group: "L", teamA: "Angleterre", teamB: "Croatie",  date: "2026-06-17", time: "12:00", stadium: "Toronto",      status: "upcoming" },
  { id: 68, group: "L", teamA: "Ghana",      teamB: "Panama",   date: "2026-06-17", time: "21:00", stadium: "Vancouver",    status: "upcoming" },
  { id: 69, group: "L", teamA: "Angleterre", teamB: "Ghana",    date: "2026-06-23", time: "15:00", stadium: "Boston",       status: "upcoming" },
  { id: 70, group: "L", teamA: "Panama",     teamB: "Croatie",  date: "2026-06-23", time: "18:00", stadium: "Toronto",      status: "upcoming" },
  { id: 71, group: "L", teamA: "Panama",     teamB: "Angleterre", date: "2026-06-27", time: "16:00", stadium: "Toronto",      status: "upcoming" },
  { id: 72, group: "L", teamA: "Croatie",    teamB: "Ghana",    date: "2026-06-27", time: "16:00", stadium: "Vancouver",    status: "upcoming" },
];

// Récupérer les matchs à venir (statut calculé dynamiquement)
export function getUpcomingMatches(limit = 12) {
  return MATCHES
    .filter(m => getMatchStatus(m.date, m.time, m.stadium) === "upcoming")
    .slice(0, limit);
}

// Récupérer les matchs d'un groupe
export function getMatchesByGroup(groupLetter) {
  return MATCHES.filter(m => m.group === groupLetter);
}