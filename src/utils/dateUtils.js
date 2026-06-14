// src/utils/dateUtils.js
// Timezone correcte par stade — heures locales de l'appareil

const STADIUM_TIMEZONE = {
  "New York":      "America/New_York",
  "Boston":        "America/New_York",
  "Philadelphia":  "America/New_York",
  "Miami":         "America/New_York",
  "Atlanta":       "America/New_York",
  "Orlando":       "America/New_York",
  "Toronto":       "America/Toronto",
  "Dallas":        "America/Chicago",
  "Houston":       "America/Chicago",
  "Kansas City":   "America/Chicago",
  "Guadalajara":   "America/Mexico_City",
  "Monterrey":     "America/Monterrey",
  "Mexico City":   "America/Mexico_City",
  "Los Angeles":   "America/Los_Angeles",
  "San Francisco": "America/Los_Angeles",
  "Seattle":       "America/Los_Angeles",
  "Vancouver":     "America/Vancouver",
};

/**
 * Convertit heure locale du stade → objet Date UTC
 */
export function matchToLocalDate(dateStr, timeStr, stadium) {
  const tz = STADIUM_TIMEZONE[stadium] ?? "America/New_York";

  // On crée une date "naïve" en UTC, puis on trouve l'offset réel du stade
  const naiveUtc = new Date(`${dateStr}T${timeStr}:00Z`);

  // Formatter pour lire l'heure dans la timezone du stade
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    fmt.formatToParts(naiveUtc).map(({ type, value }) => [type, value])
  );

  // Ce que le stade "pense" être l'heure UTC si on ignore la timezone
  const stadiumAsUtc = new Date(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`
  );

  // L'offset = écart entre l'UTC naïf et ce que le stade affiche
  const offsetMs = naiveUtc - stadiumAsUtc;

  // Vraie date UTC du match = heure locale stade + offset
  return new Date(naiveUtc.getTime() + offsetMs);
}

export function formatLocalTime(dateStr, timeStr, stadium) {
  return matchToLocalDate(dateStr, timeStr, stadium)
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatLocalDate(dateStr, timeStr, stadium) {
  return matchToLocalDate(dateStr, timeStr, stadium)
    .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function getMatchStatus(dateStr, timeStr, stadium) {
  const now       = new Date();
  const matchDate = matchToLocalDate(dateStr, timeStr, stadium);
  const endDate   = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);
  if (now < matchDate) return "upcoming";
  if (now >= matchDate && now <= endDate) return "live";
  return "finished";
}

export function isMatchEditable(dateStr, timeStr, stadium) {
  return new Date() < matchToLocalDate(dateStr, timeStr, stadium);
}

export function timeUntilMatch(dateStr, timeStr, stadium) {
  const diff = matchToLocalDate(dateStr, timeStr, stadium) - new Date();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0)    return `dans ${days}j ${hours}h`;
  if (hours > 0)   return `dans ${hours}h ${minutes}min`;
  if (minutes > 0) return `dans ${minutes}min`;
  return "Bientôt !";
}
