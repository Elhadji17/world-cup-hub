// src/data/match-engine.js
// Moteur de match — système de zones + boucle de ticks façon Football Manager.
// Interface externe inchangée : Match.jsx n'a pas besoin d'être modifié.

import { applyRoleBoost, getMatchupMultiplier } from "./player-roles";
import { applyFormMultiplier }                   from "./match-form";
import { getMoraleInfo }                          from "./match-morale";

export const TEAM_KEY = "wch_team";

// ── Zones du terrain ─────────────────────────────────────────────────────
const ZONES = ["defense", "milieu", "attaque", "surface"];

// ── Tactiques ────────────────────────────────────────────────────────────
export const TACTICS = [
  {
    id:    "balanced",
    name:  "Formation équilibrée",
    emoji: "⚖️",
    desc:  "Aucun bonus ni malus — un style solide en toutes circonstances",
    style: "BALANCED",
    pressing: "MOYEN", block: "MOYEN", width: "NORMAL", tempo: "NORMAL",
    attMult: 1.0, defMult: 1.0, oppAttMult: 1.0,
    color: "from-blue-600 to-blue-800",
  },
  {
    id:    "attack",
    name:  "Attaque totale",
    emoji: "🔥",
    desc:  "+25% d'attaque mais -20% de défense — tout pour marquer",
    style: "ATTAQUE_PLACEE",
    pressing: "HAUT", block: "HAUT", width: "LARGE", tempo: "RAPIDE",
    attMult: 1.25, defMult: 0.8, oppAttMult: 1.1,
    color: "from-red-600 to-orange-700",
  },
  {
    id:    "press",
    name:  "Pressing haut",
    emoji: "⚡",
    desc:  "+15% attaque et défense si ton équipe est physique, sinon ça fatigue",
    style: "PRESSING_HAUT",
    pressing: "HAUT", block: "HAUT", width: "LARGE", tempo: "RAPIDE",
    attMult: 1.15, defMult: 1.1, oppAttMult: 1.0,
    color: "from-yellow-500 to-amber-700",
    requiresPHY: true,
  },
  {
    id:    "defense",
    name:  "Défense solide",
    emoji: "🛡️",
    desc:  "+25% défense mais -20% attaque — bloquer puis contre-attaquer",
    style: "CONTRE",
    pressing: "BAS", block: "BAS", width: "ETROIT", tempo: "LENT",
    attMult: 0.8, defMult: 1.25, oppAttMult: 0.85,
    color: "from-gray-600 to-gray-800",
  },
];

// ── Équipes IA adverses ──────────────────────────────────────────────────
export const AI_TEAMS = [
  {
    name: "Les Étoiles du Monde", emoji: "🌍", rating: 82,
    color: "from-blue-700 to-blue-900",
    tactic: TACTICS[0],
    players: [
      { id: "ai1", name: "Rodriguez", rating: 84, stats: { PAC: 82, TIR: 85, PAS: 78, DRI: 80, DEF: 45, PHY: 82 }, rarity: "silver", flag: "🇧🇷", position: "ATT" },
      { id: "ai2", name: "Mueller",   rating: 80, stats: { PAC: 75, TIR: 82, PAS: 80, DRI: 78, DEF: 50, PHY: 78 }, rarity: "silver", flag: "🇩🇪", position: "MIL" },
      { id: "ai3", name: "Hernandez", rating: 83, stats: { PAC: 88, TIR: 80, PAS: 75, DRI: 85, DEF: 40, PHY: 75 }, rarity: "silver", flag: "🇲🇽", position: "ATT" },
    ],
  },
  {
    name: "Dream Team Africa", emoji: "🌍", rating: 79,
    color: "from-green-700 to-green-900",
    tactic: TACTICS[2],
    players: [
      { id: "ai4", name: "Diallo",  rating: 78, stats: { PAC: 90, TIR: 75, PAS: 72, DRI: 82, DEF: 42, PHY: 80 }, rarity: "bronze", flag: "🇸🇳", position: "ATT" },
      { id: "ai5", name: "Konaté",  rating: 80, stats: { PAC: 75, TIR: 55, PAS: 68, DRI: 65, DEF: 88, PHY: 90 }, rarity: "silver", flag: "🇫🇷", position: "DEF" },
      { id: "ai6", name: "Traoré",  rating: 79, stats: { PAC: 85, TIR: 78, PAS: 70, DRI: 84, DEF: 38, PHY: 74 }, rarity: "bronze", flag: "🇨🇮", position: "ATT" },
    ],
  },
  {
    name: "Champions d'Europe", emoji: "🏆", rating: 87,
    color: "from-purple-700 to-purple-900",
    tactic: TACTICS[1],
    players: [
      { id: "ai7", name: "Silva",   rating: 88, stats: { PAC: 72, TIR: 60, PAS: 75, DRI: 70, DEF: 92, PHY: 90 }, rarity: "gold", flag: "🇵🇹", position: "DEF" },
      { id: "ai8", name: "Kroos",   rating: 87, stats: { PAC: 68, TIR: 80, PAS: 95, DRI: 82, DEF: 70, PHY: 72 }, rarity: "gold", flag: "🇩🇪", position: "MIL" },
      { id: "ai9", name: "Benzema", rating: 90, stats: { PAC: 78, TIR: 92, PAS: 82, DRI: 88, DEF: 38, PHY: 82 }, rarity: "gold", flag: "🇫🇷", position: "ATT" },
    ],
  },
  {
    name: "Légendes Mondiales", emoji: "💎", rating: 93,
    color: "from-yellow-600 to-amber-800",
    tactic: TACTICS[1],
    players: [
      { id: "ai10", name: "El Maestro", rating: 95, stats: { PAC: 88, TIR: 96, PAS: 95, DRI: 98, DEF: 42, PHY: 72 }, rarity: "legendary", flag: "🇦🇷", position: "ATT" },
      { id: "ai11", name: "CR Legacy",  rating: 94, stats: { PAC: 90, TIR: 96, PAS: 82, DRI: 93, DEF: 36, PHY: 92 }, rarity: "legendary", flag: "🇵🇹", position: "ATT" },
      { id: "ai12", name: "The Kaiser", rating: 90, stats: { PAC: 75, TIR: 65, PAS: 80, DRI: 75, DEF: 95, PHY: 92 }, rarity: "gold",      flag: "🇩🇪", position: "DEF" },
    ],
  },
];

// ── Calcul stats équipe ───────────────────────────────────────────────────
export function calcTeamStats(players, opponentPlayers = [], formMap = {}, morale = 3) {
  if (!players || players.length === 0) return { ATT: 50, MIL: 50, DEF: 50, PHY: 50, rating: 50 };
  const total      = players.length;
  const moraleInfo = getMoraleInfo(morale);
  const effectiveStats = key => players.reduce((s, p) => {
    let stats   = p.role ? applyRoleBoost(p, p.role) : (p.stats ?? {});
    stats       = applyFormMultiplier(stats, p, formMap);
    const matchup = opponentPlayers.length ? getMatchupMultiplier(p, opponentPlayers) : 1;
    const isOff = ["TIR","PAC","DRI","PAS"].includes(key);
    const isDef = ["DEF","PHY"].includes(key);
    let val = stats[key] ?? 60;
    if (isOff) val = val * matchup * moraleInfo.attBonus;
    if (isDef) val = val * moraleInfo.defBonus;
    return s + val;
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

// ── Appliquer tactique ─────────────────────────────────────────────────────
export function applyTactic(stats, tactic) {
  let attMult = tactic.attMult;
  if (tactic.requiresPHY && stats.PHY < 78) attMult = 0.95;
  return {
    ATT: Math.round(stats.ATT * attMult),
    DEF: Math.round(stats.DEF * tactic.defMult),
    MIL: stats.MIL,
    PHY: stats.PHY,
  };
}

// ── Outils internes ────────────────────────────────────────────────────────
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function roll(pct)          { return Math.random() * 100 < pct; }
function pickRandom(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
function randomWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { if (r < item.weight) return item; r -= item.weight; }
  return items[0];
}

// ── Bonus/malus tactiques sur les actions ─────────────────────────────────
function tacticPassBonus(tactic) {
  let b = 0;
  if (tactic.style === "BALANCED")       b += 0;
  if (tactic.style === "ATTAQUE_PLACEE") b += 8;
  if (tactic.tempo  === "LENT")          b += 5;
  if (tactic.width  === "ETROIT")        b += 5;
  return b;
}
function tacticShotBonus(tactic) {
  let b = 0;
  if (tactic.style === "ATTAQUE_PLACEE") b += 10;
  if (tactic.tempo  === "RAPIDE")        b += 5;
  return b;
}
function tacticDribbleBonus(tactic) {
  let b = 0;
  if (tactic.style === "PRESSING_HAUT") b += 5;
  if (tactic.width  === "LARGE")        b += 5;
  return b;
}
function tacticDefenseBonus(tactic) {
  let b = 0;
  if (tactic.block    === "BAS")  b += 10;
  if (tactic.pressing === "HAUT") b += 5;
  return b;
}

// ── Choix de l'action selon zone + tactique ───────────────────────────────
function chooseAction(zone, tactic) {
  if (zone === "surface") {
    return randomWeighted([
      { type: "shot",   weight: 60 },
      { type: "pass",   weight: 25 },
      { type: "dribble",weight: 15 },
    ]);
  }
  if (zone === "attaque") {
    return randomWeighted([
      { type: "shot",   weight: 15 },
      { type: "pass",   weight: 55 },
      { type: "dribble",weight: 30 },
    ]);
  }
  // Milieu et défense — influencé par la tactique
  const style = tactic?.style ?? "BALANCED";
  if (style === "ATTAQUE_PLACEE") {
    return randomWeighted([
      { type: "pass",   weight: 65 },
      { type: "dribble",weight: 20 },
      { type: "clear",  weight: 15 },
    ]);
  }
  if (style === "CONTRE") {
    return randomWeighted([
      { type: "clear",  weight: 55 },
      { type: "pass",   weight: 30 },
      { type: "dribble",weight: 15 },
    ]);
  }
  if (style === "PRESSING_HAUT") {
    return randomWeighted([
      { type: "pass",   weight: 50 },
      { type: "dribble",weight: 30 },
      { type: "clear",  weight: 20 },
    ]);
  }
  return randomWeighted([
    { type: "pass",   weight: 60 },
    { type: "dribble",weight: 20 },
    { type: "clear",  weight: 20 },
  ]);
}

// ── Résolution des actions ─────────────────────────────────────────────────
function resolveAction(actionType, attackStats, defStats, zone, attackTactic, defTactic) {
  if (actionType === "pass") {
    const score = (attackStats.MIL - defStats.MIL)
      + tacticPassBonus(attackTactic)
      - tacticDefenseBonus(defTactic);
    return { success: roll(clamp(50 + score * 0.3, 30, 80)) };
  }
  if (actionType === "dribble") {
    const score = (attackStats.ATT - defStats.DEF)
      + tacticDribbleBonus(attackTactic)
      - tacticDefenseBonus(defTactic);
    return { success: roll(clamp(40 + score * 0.3, 20, 70)) };
  }
  if (actionType === "shot") {
    let score = attackStats.ATT - defStats.DEF
      + tacticShotBonus(attackTactic)
      - tacticDefenseBonus(defTactic);
    if (zone === "surface") score += 5; // bonus surface réduit
    // Chance de but beaucoup plus réaliste — max ~35%
    return { success: roll(clamp(8 + score * 0.25, 2, 35)), isShot: true };
  }
  if (actionType === "clear") {
    return { success: true, turnover: true };
  }
  return { success: true };
}

// ── Progression de zone — plus difficile qu'avant ─────────────────────────
function advanceZone(zone) {
  // Pas de progression directe défense → surface en un tick
  // On avance d'une zone à la fois avec une chance de ralentissement
  const idx = ZONES.indexOf(zone);
  if (idx < ZONES.length - 1) {
    // 70% de chance d'avancer, 30% de rester sur place
    return Math.random() < 0.7 ? ZONES[idx + 1] : zone;
  }
  return zone;
}

// ── Banque d'événements narratifs ─────────────────────────────────────────
export const KEY_ACTIONS = {
  miss:   { emoji: "😬", label: "rate une occasion en or" },
  save:   { emoji: "🧤", label: "sort une parade décisive" },
  corner: { emoji: "🚩", label: "obtient un corner dangereux" },
  yellow: { emoji: "🟨", label: "reçoit un carton jaune" },
};

// ── Simuler une mi-temps (boucle de ticks) ────────────────────────────────
export function generateHalfEvents(
  _ignored1, _ignored2, // compatibilité ancienne interface (inutilisés)
  myPlayers, aiPlayers,
  minuteOffset,
  myStats = {}, aiStats = {},
  myTactic = TACTICS[0], aiTactic = TACTICS[0]
) {
  const events  = [];
  const minutes = new Set();

  // État de match
  let zone          = "milieu";
  let possession    = "me"; // "me" | "ai"
  let myGoals       = 0;
  let aiGoals       = 0;

  // Stats accumulées pour le rapport
  let myShots = 0, aiShots = 0;
  let myOnTarget = 0, aiOnTarget = 0;
  let myDuelsWon = 0, aiDuelsWon = 0;
  let myPossessionTicks = 0;

  const addEvent = (team, player, minute, type) => {
    let m = minute;
    while (minutes.has(m)) m = Math.min(minuteOffset + 45, m + 1);
    minutes.add(m);
    events.push({ team, player, minute: m, type });
  };

  const getPlayerName = (team, zone) => {
    const pool = team === "me"
      ? (zone === "surface" || zone === "attaque"
          ? (myPlayers.filter(p => p.position === "ATT" || p.position === "MIL").length
              ? myPlayers.filter(p => p.position === "ATT" || p.position === "MIL")
              : myPlayers)
          : myPlayers)
      : aiPlayers;
    const p = pool[Math.floor(Math.random() * Math.max(pool.length, 1))];
    return team === "me"
      ? (p?.name?.split(" ").pop() ?? "Joueur")
      : (p?.name ?? "Adversaire");
  };

  // 45 ticks = 45 minutes simulées
  for (let tick = 1; tick <= 45; tick++) {
    const minute      = minuteOffset + tick;
    const atkStats    = possession === "me" ? myStats : aiStats;
    const defStats    = possession === "me" ? aiStats : myStats;
    const atkTactic   = possession === "me" ? myTactic : aiTactic;
    const defTacticObj = possession === "me" ? aiTactic : myTactic;

    if (possession === "me") myPossessionTicks++;

    const action = chooseAction(zone, atkTactic);
    const result = resolveAction(action.type, atkStats, defStats, zone, atkTactic, defTacticObj);

    if (action.type === "shot") {
      if (possession === "me") { myShots++; }
      else                     { aiShots++; }

      if (result.success) {
        // BUT !
        if (possession === "me") { myGoals++; myOnTarget++; }
        else                     { aiGoals++; aiOnTarget++; }
        addEvent(possession, getPlayerName(possession, zone), minute, "goal");
        zone = "milieu";
        possession = possession === "me" ? "ai" : "me"; // relance adverse
      } else {
        // Tir raté
        if (possession === "me") { if (Math.random() < 0.6) myOnTarget++; }
        else                     { if (Math.random() < 0.6) aiOnTarget++; }
        // Événement narratif
        const evType = Math.random() < 0.5 ? "miss" : "save";
        addEvent(possession, getPlayerName(possession, zone), minute, evType);
        possession = possession === "me" ? "ai" : "me";
        zone = "milieu";
      }
    } else if (action.type === "dribble") {
      if (possession === "me") myDuelsWon += result.success ? 1 : 0;
      else                     aiDuelsWon += result.success ? 1 : 0;

      if (result.success) {
        zone = advanceZone(zone);
      } else {
        possession = possession === "me" ? "ai" : "me";
        zone = "milieu";
      }
    } else if (action.type === "pass") {
      if (result.success) {
        zone = advanceZone(zone);
      } else {
        possession = possession === "me" ? "ai" : "me";
        zone = "milieu";
      }
    } else if (action.type === "clear") {
      possession = possession === "me" ? "ai" : "me";
      zone = "milieu";
    }

    // Événements narratifs aléatoires (carton jaune, corner) — hors tirs
    if (action.type !== "shot" && Math.random() < 0.08) {
      const evType = Math.random() < 0.5 ? "corner" : "yellow";
      const team   = Math.random() < 0.5 ? "me" : "ai";
      addEvent(team, getPlayerName(team, zone), minute, evType);
    }
  }

  // Possession en %
  const myPoss = Math.round((myPossessionTicks / 45) * 100);

  // xG simplifié
  const myXG = parseFloat(((myStats.ATT ?? 70) / ((myStats.ATT ?? 70) + (aiStats.DEF ?? 70)) * myShots * 0.35).toFixed(1));
  const aiXG = parseFloat(((aiStats.ATT ?? 70) / ((aiStats.ATT ?? 70) + (myStats.DEF ?? 70)) * aiShots * 0.35).toFixed(1));

  const halfStats = {
    possession: { me: myPoss, ai: 100 - myPoss },
    shots:      { me: myShots, ai: aiShots },
    onTarget:   { me: myOnTarget, ai: aiOnTarget },
    xG:         { me: myXG, ai: aiXG },
    duels:      { me: myDuelsWon, ai: aiDuelsWon },
  };

  return {
    events:  events.sort((a, b) => a.minute - b.minute),
    halfStats,
    myGoals,
    aiGoals,
  };
}

// simulateHalfGoals maintenu pour compatibilité (inutilisé si on utilise generateHalfEvents)
export function simulateHalfGoals(attackStrength, defenseStrength) {
  const diff = (attackStrength - defenseStrength) / 28;
  const base = Math.max(0, diff + (Math.random() * 1.3 - 0.3));
  return Math.round(Math.min(base, 4));
}

// Agréger les stats de deux mi-temps
export function mergeMatchStats(stats1, stats2) {
  if (!stats1) return stats2;
  if (!stats2) return stats1;
  return {
    possession: {
      me: Math.round((stats1.possession.me + stats2.possession.me) / 2),
      ai: Math.round((stats1.possession.ai + stats2.possession.ai) / 2),
    },
    shots:    { me: stats1.shots.me    + stats2.shots.me,    ai: stats1.shots.ai    + stats2.shots.ai    },
    onTarget: { me: stats1.onTarget.me + stats2.onTarget.me, ai: stats1.onTarget.ai + stats2.onTarget.ai },
    xG:       { me: parseFloat((stats1.xG.me + stats2.xG.me).toFixed(1)), ai: parseFloat((stats1.xG.ai + stats2.xG.ai).toFixed(1)) },
    duels:    { me: stats1.duels.me    + stats2.duels.me,    ai: stats1.duels.ai    + stats2.duels.ai    },
  };
}
