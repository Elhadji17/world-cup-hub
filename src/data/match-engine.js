// src/data/match-engine.js
// Moteur de calcul du Match — logique pure, sans JSX.
// Match.jsx importe ces fonctions et ne gère que l'affichage.

import { applyRoleBoost, getMatchupMultiplier } from "./player-roles";
import { applyFormMultiplier } from "./match-form";
import { getMoraleInfo } from "./match-morale";

export const TEAM_KEY = "wch_team";

// ── Tactiques ────────────────────────────────────────────────────────────
export const TACTICS = [
  {
    id:    "balanced",
    name:  "Formation équilibrée",
    emoji: "⚖️",
    desc:  "Aucun bonus ni malus — un style solide en toutes circonstances",
    attMult: 1.0, defMult: 1.0, oppAttMult: 1.0,
    color: "from-blue-600 to-blue-800",
  },
  {
    id:    "attack",
    name:  "Attaque totale",
    emoji: "🔥",
    desc:  "+25% d'attaque mais -20% de défense — tout pour marquer",
    attMult: 1.25, defMult: 0.8, oppAttMult: 1.1,
    color: "from-red-600 to-orange-700",
  },
  {
    id:    "press",
    name:  "Pressing haut",
    emoji: "⚡",
    desc:  "+15% attaque et défense si ton équipe est physique, sinon ça fatigue",
    attMult: 1.15, defMult: 1.1, oppAttMult: 1.0,
    color: "from-yellow-500 to-amber-700",
    requiresPHY: true,
  },
  {
    id:    "defense",
    name:  "Défense solide",
    emoji: "🛡️",
    desc:  "+25% défense mais -20% attaque — bloquer puis contre-attaquer",
    attMult: 0.8, defMult: 1.25, oppAttMult: 0.85,
    color: "from-gray-600 to-gray-800",
  },
];

// ── Équipes IA adverses ──────────────────────────────────────────────────
export const AI_TEAMS = [
  {
    name:   "Les Étoiles du Monde",
    emoji:  "🌍",
    rating: 82,
    color:  "from-blue-700 to-blue-900",
    players: [
      { id: "ai1", name: "Rodriguez",  rating: 84, stats: { PAC: 82, TIR: 85, PAS: 78, DRI: 80, DEF: 45, PHY: 82 }, rarity: "silver", flag: "🇧🇷", position: "ATT" },
      { id: "ai2", name: "Mueller",    rating: 80, stats: { PAC: 75, TIR: 82, PAS: 80, DRI: 78, DEF: 50, PHY: 78 }, rarity: "silver", flag: "🇩🇪", position: "MIL" },
      { id: "ai3", name: "Hernandez",  rating: 83, stats: { PAC: 88, TIR: 80, PAS: 75, DRI: 85, DEF: 40, PHY: 75 }, rarity: "silver", flag: "🇲🇽", position: "ATT" },
    ],
  },
  {
    name:   "Dream Team Africa",
    emoji:  "🌍",
    rating: 79,
    color:  "from-green-700 to-green-900",
    players: [
      { id: "ai4", name: "Diallo",    rating: 78, stats: { PAC: 90, TIR: 75, PAS: 72, DRI: 82, DEF: 42, PHY: 80 }, rarity: "bronze", flag: "🇸🇳", position: "ATT" },
      { id: "ai5", name: "Konaté",    rating: 80, stats: { PAC: 75, TIR: 55, PAS: 68, DRI: 65, DEF: 88, PHY: 90 }, rarity: "silver", flag: "🇫🇷", position: "DEF" },
      { id: "ai6", name: "Traoré",    rating: 79, stats: { PAC: 85, TIR: 78, PAS: 70, DRI: 84, DEF: 38, PHY: 74 }, rarity: "bronze", flag: "🇨🇮", position: "ATT" },
    ],
  },
  {
    name:   "Champions d'Europe",
    emoji:  "🏆",
    rating: 87,
    color:  "from-purple-700 to-purple-900",
    players: [
      { id: "ai7", name: "Silva",     rating: 88, stats: { PAC: 72, TIR: 60, PAS: 75, DRI: 70, DEF: 92, PHY: 90 }, rarity: "gold", flag: "🇵🇹", position: "DEF" },
      { id: "ai8", name: "Kroos",     rating: 87, stats: { PAC: 68, TIR: 80, PAS: 95, DRI: 82, DEF: 70, PHY: 72 }, rarity: "gold", flag: "🇩🇪", position: "MIL" },
      { id: "ai9", name: "Benzema",   rating: 90, stats: { PAC: 78, TIR: 92, PAS: 82, DRI: 88, DEF: 38, PHY: 82 }, rarity: "gold", flag: "🇫🇷", position: "ATT" },
    ],
  },
  {
    name:   "Légendes Mondiales",
    emoji:  "💎",
    rating: 93,
    color:  "from-yellow-600 to-amber-800",
    players: [
      { id: "ai10", name: "El Maestro",  rating: 95, stats: { PAC: 88, TIR: 96, PAS: 95, DRI: 98, DEF: 42, PHY: 72 }, rarity: "legendary", flag: "🇦🇷", position: "ATT" },
      { id: "ai11", name: "CR Legacy",   rating: 94, stats: { PAC: 90, TIR: 96, PAS: 82, DRI: 93, DEF: 36, PHY: 92 }, rarity: "legendary", flag: "🇵🇹", position: "ATT" },
      { id: "ai12", name: "The Kaiser",  rating: 90, stats: { PAC: 75, TIR: 65, PAS: 80, DRI: 75, DEF: 95, PHY: 92 }, rarity: "gold",      flag: "🇩🇪", position: "DEF" },
    ],
  },
];

// Calculer les stats moyennes d'une équipe — applique boosts de rôle + interactions
// croisées avec les rôles de l'effectif adverse + forme du jour + moral (tous optionnels)
export function calcTeamStats(players, opponentPlayers = [], formMap = {}, morale = 3) {
  if (!players || players.length === 0) return { ATT: 50, MIL: 50, DEF: 50, PHY: 50, rating: 50 };
  const total = players.length;
  const moraleInfo = getMoraleInfo(morale);
  const effectiveStats = key => players.reduce((s, p) => {
    let stats = p.role ? applyRoleBoost(p, p.role) : (p.stats ?? {});
    stats = applyFormMultiplier(stats, p, formMap);
    const matchup = opponentPlayers.length ? getMatchupMultiplier(p, opponentPlayers) : 1;
    const isOffensiveStat = key === "TIR" || key === "PAC" || key === "DRI" || key === "PAS";
    const isDefensiveStat = key === "DEF" || key === "PHY";
    let value = stats[key] ?? 60;
    if (isOffensiveStat) value = value * matchup * moraleInfo.attBonus;
    if (isDefensiveStat) value = value * moraleInfo.defBonus;
    return s + value;
  }, 0) / total;
  const avg = key => Math.round(effectiveStats(key));
  return {
    ATT:    Math.round((avg("TIR") + avg("PAC") + avg("DRI")) / 3),
    MIL:    Math.round((avg("PAS") + avg("DRI")) / 2),
    DEF:    Math.round((avg("DEF") + avg("PHY")) / 2),
    PHY:    avg("PHY"),
    rating: Math.round(players.reduce((s, p) => s + (p.rating ?? 70), 0) / total),
  };
}

// Simuler le score d'une demi (45 min) avec tactique appliquée
export function simulateHalfGoals(attackStrength, defenseStrength) {
  const diff = (attackStrength - defenseStrength) / 28;
  const base = Math.max(0, diff + (Math.random() * 1.3 - 0.3));
  return Math.round(Math.min(base, 4));
}

// Appliquer une tactique aux stats d'équipe
export function applyTactic(stats, tactic) {
  let attMult = tactic.attMult;
  if (tactic.requiresPHY && stats.PHY < 78) {
    attMult = 0.95;
  }
  return {
    ATT: Math.round(stats.ATT * attMult),
    DEF: Math.round(stats.DEF * tactic.defMult),
  };
}

// Banque d'actions clés non décisives — ajoute du rythme entre les buts
export const KEY_ACTIONS = {
  miss:   { emoji: "😬", label: "rate une occasion en or" },
  save:   { emoji: "🧤", label: "sort une parade décisive" },
  corner: { emoji: "🚩", label: "obtient un corner dangereux" },
  yellow: { emoji: "🟨", label: "reçoit un carton jaune" },
};

// Générer les événements d'une demi + stats de match associées
export function generateHalfEvents(myGoals, aiGoals, myPlayers, aiPlayers, minuteOffset, myStats = {}, aiStats = {}) {
  const events = [];
  const minutes = new Set();

  const addEvent = (team, player, minute, type = "goal") => {
    while (minutes.has(minute)) minute = Math.min(minuteOffset + 45, minute + 1);
    minutes.add(minute);
    events.push({ team, player, minute, type });
  };

  const attackers = myPlayers.filter(p => p.position === "ATT" || p.position === "MIL");
  const aiAttackers = aiPlayers;

  for (let i = 0; i < myGoals; i++) {
    const scorer = attackers[Math.floor(Math.random() * Math.max(attackers.length, 1))];
    addEvent("me", scorer?.name?.split(" ").pop() ?? "Joueur", minuteOffset + Math.floor(Math.random() * 43) + 1, "goal");
  }
  for (let i = 0; i < aiGoals; i++) {
    const scorer = aiAttackers[Math.floor(Math.random() * Math.max(aiAttackers.length, 1))];
    addEvent("ai", scorer?.name ?? "Adversaire", minuteOffset + Math.floor(Math.random() * 43) + 1, "goal");
  }

  // Actions clés non décisives — 5 à 8 par mi-temps
  const actionTypes = Object.keys(KEY_ACTIONS);
  const keyActionCount = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < keyActionCount; i++) {
    const team = Math.random() < 0.5 ? "me" : "ai";
    const pool = team === "me" ? (myPlayers.length ? myPlayers : attackers) : aiPlayers;
    const actor = pool[Math.floor(Math.random() * Math.max(pool.length, 1))];
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const name = team === "me" ? (actor?.name?.split(" ").pop() ?? "Joueur") : (actor?.name ?? "Adversaire");
    addEvent(team, name, minuteOffset + Math.floor(Math.random() * 43) + 1, actionType);
  }

  // Calculer les stats de cette demi-temps
  const myATT  = myStats.ATT  ?? 70;
  const aiATT  = aiStats.ATT  ?? 70;
  const myDEF  = myStats.DEF  ?? 70;
  const aiDEF  = aiStats.DEF  ?? 70;
  const myMIL  = myStats.MIL  ?? 70;
  const aiMIL  = aiStats.MIL  ?? 70;

  // Possession estimée (basée sur milieu)
  const totalMIL = myMIL + aiMIL;
  const myPoss = Math.round((myMIL / totalMIL) * 100);

  // Tirs = buts + occasions manquées (events "miss" + "save") + variance aléatoire
  const myMissEvents  = events.filter(e => e.team === "me" && (e.type === "miss" || e.type === "save")).length;
  const aiMissEvents  = events.filter(e => e.team === "ai" && (e.type === "miss" || e.type === "save")).length;
  const myShots  = myGoals + myMissEvents + Math.floor(Math.random() * 2);
  const aiShots  = aiGoals + aiMissEvents + Math.floor(Math.random() * 2);
  const myOnTarget  = myGoals + Math.max(0, myMissEvents - 1);
  const aiOnTarget  = aiGoals + Math.max(0, aiMissEvents - 1);

  // xG simplifié : qualité des occasions = ATT / (ATT + DEF adverse)
  const myXG = parseFloat(((myATT / (myATT + aiDEF)) * (myShots * 0.35)).toFixed(1));
  const aiXG = parseFloat(((aiATT / (aiATT + myDEF)) * (aiShots * 0.35)).toFixed(1));

  // Duels gagnés : ratio ATT vs DEF
  const totalDuels = 8 + Math.floor(Math.random() * 5);
  const myDuelsWon = Math.round((myATT / (myATT + aiDEF)) * totalDuels);
  const aiDuelsWon = totalDuels - myDuelsWon;

  const halfStats = {
    possession: { me: myPoss, ai: 100 - myPoss },
    shots:      { me: myShots, ai: aiShots },
    onTarget:   { me: myOnTarget, ai: aiOnTarget },
    xG:         { me: myXG, ai: aiXG },
    duels:      { me: myDuelsWon, ai: aiDuelsWon },
  };

  return { events: events.sort((a, b) => a.minute - b.minute), halfStats };
}

// Agréger les stats de deux mi-temps en stats complètes de match
export function mergeMatchStats(stats1, stats2) {
  if (!stats1) return stats2;
  if (!stats2) return stats1;
  return {
    possession: {
      me: Math.round((stats1.possession.me + stats2.possession.me) / 2),
      ai: Math.round((stats1.possession.ai + stats2.possession.ai) / 2),
    },
    shots:    { me: stats1.shots.me + stats2.shots.me,       ai: stats1.shots.ai + stats2.shots.ai },
    onTarget: { me: stats1.onTarget.me + stats2.onTarget.me, ai: stats1.onTarget.ai + stats2.onTarget.ai },
    xG:       { me: parseFloat((stats1.xG.me + stats2.xG.me).toFixed(1)), ai: parseFloat((stats1.xG.ai + stats2.xG.ai).toFixed(1)) },
    duels:    { me: stats1.duels.me + stats2.duels.me,       ai: stats1.duels.ai + stats2.duels.ai },
  };
}
