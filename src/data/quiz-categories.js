// src/data/quiz-categories.js
// Définition des catégories de quiz

export const CATEGORIES = [
  {
    id:          "world-cup",
    title:       "Coupe du Monde",
    emoji:       "🌍",
    description: "Histoire, records et moments légendaires des Coupes du Monde",
    color:       "from-green-600 to-emerald-800",
    border:      "border-green-500/40",
    questions:   "questions-world-cup.json",
    difficulty:  "Moyen",
    count:       20,
  },
  {
    id:          "senegal",
    title:       "Quiz Sénégal",
    emoji:       "🇸🇳",
    description: "Les Lions de la Téranga, l'AFCON et les stars sénégalaises",
    color:       "from-yellow-600 to-green-700",
    border:      "border-yellow-500/40",
    questions:   "questions-senegal.json",
    difficulty:  "Facile",
    count:       20,
  },
  {
    id:          "france",
    title:       "Quiz France",
    emoji:       "🇫🇷",
    description: "Les Bleus, leurs titres, leurs légendes",
    color:       "from-blue-600 to-red-700",
    border:      "border-blue-500/40",
    questions:   "questions-france.json",
    difficulty:  "Moyen",
    count:       20,
  },
  {
    id: "champions-league",
    title:       "Ligue des Champions",
    emoji:       "🏆",
    description: "Clubs, finales, records et nuits européennes inoubliables",
    color:       "from-blue-800 to-purple-900",
    border:      "border-blue-400/40",
    questions: "questions-champions-league.json",
    difficulty:  "Difficile",
    count:       20,
  },
  {
    id:          "ballon-dor",
    title:       "Ballon d'Or",
    emoji:       "👑",
    description: "Gagnants, années, records et anecdotes du trophée suprême",
    color:       "from-yellow-500 to-amber-700",
    border:      "border-yellow-400/40",
    questions:   "questions-ballon-dor.json",
    difficulty:  "Difficile",
    count:       20,
  },
  {
    id:          "daily",
    title:       "Quiz du Jour",
    emoji:       "🔥",
    description: "Un nouveau quiz chaque jour — classement 24h renouvelé",
    color:       "from-red-600 to-orange-700",
    border:      "border-red-500/40",
    questions:   "questions-daily.json",
    difficulty:  "Varié",
    count:       10,
    isDaily:     true,
  },
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}
