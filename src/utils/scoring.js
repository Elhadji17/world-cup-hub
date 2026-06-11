// Système de scoring — inspiré de LigiPredictor (MIT)
// Source : https://github.com/ckagiri/predictor
//
// Règles :
//   Score exact            → +15 pts  (+ ×2 si joker)
//   Bon résultat + écart   → +10 pts
//   Bon résultat           →  +7 pts
//   Bon écart de buts      →  +3 pts
//   Buts exacts (dom.)     →  +1 pt
//   Buts exacts (ext.)     →  +1 pt
//   Score proche (±1 but)  →  +2 pts
//   Mauvais pronostic      →   0 pt

/**
 * Calcule le résultat d'un match
 * @param {number} scoreA - buts équipe A
 * @param {number} scoreB - buts équipe B
 * @returns {"A"|"B"|"Draw"}
 */
export function getOutcome(scoreA, scoreB) {
  if (scoreA > scoreB) return "A";
  if (scoreB > scoreA) return "B";
  return "Draw";
}

/**
 * Calcule les points gagnés par un pronostic
 * @param {{ scoreA: number, scoreB: number }} prediction - pronostic utilisateur
 * @param {{ scoreA: number, scoreB: number }} actual     - score réel
 * @param {boolean} isJoker                               - si ce match est le joker
 * @returns {{ points: number, breakdown: string }}
 */
export function calculatePoints(prediction, actual, isJoker = false) {
  const predOutcome   = getOutcome(prediction.scoreA, prediction.scoreB);
  const actualOutcome = getOutcome(actual.scoreA, actual.scoreB);

  let points = 0;
  let breakdown = [];

  // Score exact
  if (prediction.scoreA === actual.scoreA && prediction.scoreB === actual.scoreB) {
    points += 15;
    breakdown.push("Score exact +15");

    // Bonus buts individuels inclus dans score exact
  } else {
    // Bon résultat
    if (predOutcome === actualOutcome) {
      points += 7;
      breakdown.push("Bon résultat +7");

      // Bon écart de buts
      const predDiff   = prediction.scoreA - prediction.scoreB;
      const actualDiff = actual.scoreA - actual.scoreB;
      if (predDiff === actualDiff) {
        points += 3;
        breakdown.push("Bon écart +3");
      }

      // Buts exacts côté A
      if (prediction.scoreA === actual.scoreA) {
        points += 1;
        breakdown.push("Buts A exacts +1");
      }
      // Buts exacts côté B
      if (prediction.scoreB === actual.scoreB) {
        points += 1;
        breakdown.push("Buts B exacts +1");
      }
    } else {
      // Mauvais résultat — score proche ? (±1 but sur les deux scores)
      const diffA = Math.abs(prediction.scoreA - actual.scoreA);
      const diffB = Math.abs(prediction.scoreB - actual.scoreB);
      if (diffA <= 1 && diffB <= 1) {
        points += 2;
        breakdown.push("Score proche +2");
      }
    }
  }

  // Joker — double les points
  if (isJoker && points > 0) {
    breakdown.push(`Joker ×2`);
    points *= 2;
  }

  return { points, breakdown: breakdown.join(" · ") || "Aucun point" };
}

/**
 * Compare le pronostic utilisateur avec la prédiction IA
 * @param {{ scoreA: number, scoreB: number }} userPred
 * @param {{ scoreA: number, scoreB: number }} aiPred
 * @returns {boolean}
 */
export function agreesWithAI(userPred, aiPred) {
  const userOut = getOutcome(userPred.scoreA, userPred.scoreB);
  const aiOut   = getOutcome(aiPred.scoreA, aiPred.scoreB);
  return userOut === aiOut;
}

/**
 * Calcule le score total d'un joueur
 * @param {Array<{ prediction, actual, isJoker }>} predictions
 * @returns {{ total: number, details: Array }}
 */
export function computeLeaderboardScore(predictions) {
  let total = 0;
  const details = predictions.map(({ prediction, actual, isJoker, matchId }) => {
    if (!actual) return { matchId, points: 0, pending: true };
    const { points, breakdown } = calculatePoints(prediction, actual, isJoker);
    total += points;
    return { matchId, points, breakdown, pending: false };
  });
  return { total, details };
}

// Paliers de médaille selon le total de points
export function getMedal(totalPoints) {
  if (totalPoints >= 150) return { emoji: "🥇", label: "Champion" };
  if (totalPoints >= 100) return { emoji: "🥈", label: "Expert" };
  if (totalPoints >= 50)  return { emoji: "🥉", label: "Confirmé" };
  return { emoji: "⚽", label: "Débutant" };
}