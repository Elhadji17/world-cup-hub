// src/utils/dateUtils.js
// Conversion timezone correcte par stade WC 2026

// Timezone de chaque stade
const STADIUM_TIMEZONE = {
  // Eastern Time (UTC-4 en été EDT)
  "New York":      "America/New_York",
  "Boston":        "America/New_York",
  "Philadelphia":  "America/New_York",
  "Miami":         "America/New_York",
  "Atlanta":       "America/New_York",
  "Toronto":       "America/Toronto",

  // Central Time (UTC-5 en été CDT)
  "Dallas":        "America/Chicago",
  "Houston":       "America/Chicago",
  "Kansas City":   "America/Chicago",
  "Guadalajara":   "America/Mexico_City",
  "Monterrey":     "America/Monterrey",

  // Mountain Time (UTC-6 en été MDT)
  "Mexico City":   "America/Mexico_City",

  // Pacific Time (UTC-7 en été PDT)
  "Los Angeles":   "America/Los_Angeles",
  "San Francisco": "America/Los_Angeles",
  "Seattle":       "America/Los_Angeles",
  "Vancouver":     "America/Vancouver",
  "Orlando":       "America/New_York",
};

/**
 * Convertit une date/heure de match vers un objet Date UTC
 * en tenant compte de la timezone du stade
 */
export function matchToLocalDate(dateStr, timeStr, stadium) {
  const tz = STADIUM_TIMEZONE[stadium] ?? "America/New_York";

  // Construire la date dans la timezone du stade
  // On utilise Intl pour convertir correctement
  const localStr = `${dateStr}T${timeStr}:00`;

  // Créer la date en supposant que c'est dans la timezone du stade
  // Trick : on utilise toLocaleString pour trouver l'offset
  const tempDate = new Date(localStr + "Z"); // UTC temporaire

  // Obtenir l'offset de la timezone du stade à cette date
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });

  // Méthode fiable : construire la date avec la bonne timezone via API
  // On passe par un string ISO avec timezone
  const parts = formatter.formatToParts(tempDate);
  const p = {};
  parts.forEach(({ type, value }) => { p[type] = value; });

  // Calculer l'écart entre UTC et la timezone du stade
  const utcMs   = tempDate.getTime();
  const localMs = new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`).getTime();
  const offsetMs = utcMs - localMs;

  // Construire la vraie date : heure locale du stade → UTC
  const matchUtcMs = new Date(localStr + "Z").getTime() + offsetMs;
  return new Date(matchUtcMs);
}

/**
 * Formate l'heure locale de l'appareil pour un match
 */
export function formatLocalTime(dateStr, timeStr, stadium) {
  const date = matchToLocalDate(dateStr, timeStr, stadium);
  return date.toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formate la date locale de l'appareil pour un match
 */
export function formatLocalDate(dateStr, timeStr, stadium) {
  const date = matchToLocalDate(dateStr, timeStr, stadium);
  return date.toLocaleDateString("fr-FR", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

/**
 * Statut d'un match selon l'heure locale
 */
export function getMatchStatus(dateStr, timeStr, stadium) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr, stadium);
  const endDate   = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);

  if (now < matchDate) return "upcoming";
  if (now >= matchDate && now <= endDate) return "live";
  return "finished";
}

/**
 * Vérifie si un match est encore modifiable (avant le coup d'envoi)
 */
export function isMatchEditable(dateStr, timeStr, stadium) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr, stadium);
  return now < matchDate;
}

/**
 * Compte à rebours avant un match
 */
export function timeUntilMatch(dateStr, timeStr, stadium) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr, stadium);
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
