// src/utils/dateUtils.js
// Utilitaires de dates — conversion timezone USA → heure locale appareil

// Les matchs WC 2026 sont en heure de l'Est américain (EDT = UTC-4)
// On stocke les heures en UTC-4, on convertit vers la timezone locale

/**
 * Convertit une date/heure de match (EDT = UTC-4) vers l'heure locale
 * @param {string} dateStr  — "2026-06-11"
 * @param {string} timeStr  — "13:00"
 * @returns {Date} objet Date en heure locale
 */
export function matchToLocalDate(dateStr, timeStr) {
  // Les stades sont en heure de l'Est (EDT = UTC-4) ou Central (CDT = UTC-5)
  // On utilise UTC-4 comme base (majorité des matchs)
  const isoString = `${dateStr}T${timeStr}:00-04:00`;
  return new Date(isoString);
}

/**
 * Formate l'heure locale d'un match pour l'affichage
 * @param {string} dateStr
 * @param {string} timeStr
 * @returns {string} ex: "19:00" en heure locale
 */
export function formatLocalTime(dateStr, timeStr) {
  const date = matchToLocalDate(dateStr, timeStr);
  return date.toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formate la date locale d'un match
 * @param {string} dateStr
 * @param {string} timeStr
 * @returns {string} ex: "11 juin 2026"
 */
export function formatLocalDate(dateStr, timeStr) {
  const date = matchToLocalDate(dateStr, timeStr);
  return date.toLocaleDateString("fr-FR", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

/**
 * Formate date + heure ensemble
 * @returns {string} ex: "11 juin · 19:00"
 */
export function formatLocalDateTime(dateStr, timeStr) {
  return `${formatLocalDate(dateStr, timeStr)} · ${formatLocalTime(dateStr, timeStr)}`;
}

/**
 * Détermine le statut d'un match selon l'heure locale
 * @returns {"upcoming" | "live" | "finished"}
 */
export function getMatchStatus(dateStr, timeStr) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr);
  const endDate   = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000); // +2h

  if (now < matchDate) return "upcoming";
  if (now >= matchDate && now <= endDate) return "live";
  return "finished";
}

/**
 * Vérifie si un match est encore modifiable (avant le coup d'envoi)
 * @returns {boolean}
 */
export function isMatchEditable(dateStr, timeStr) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr);
  return now < matchDate; // modifiable seulement avant le début
}

/**
 * Temps restant avant un match
 * @returns {string} ex: "2j 4h 30min" ou "Bientôt !"
 */
export function timeUntilMatch(dateStr, timeStr) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr);
  const diff      = matchDate - now;

  if (diff <= 0) return null;

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0)    return `dans ${days}j ${hours}h`;
  if (hours > 0)   return `dans ${hours}h ${minutes}min`;
  if (minutes > 0) return `dans ${minutes}min`;
  return "Bientôt !";
}
