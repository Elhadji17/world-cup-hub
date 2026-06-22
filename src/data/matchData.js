// src/data/matchData.js
// Vraies compositions pour la simulation Sénégal vs Norvège — Coupe du Monde 2026
// recentForm : notes sur les 5 derniers matchs (10 = parfait, 7 = correct, 5 = mauvais)

// Convertit un joueur du format matchData vers le format match-engine
// ratingBase → stats FIFA calculées automatiquement selon le poste
function toEnginePlayer(p) {
  const base = p.ratingBase;
  let stats;
  if (p.position === "GK") {
    stats = { PAC: Math.round(base * 0.62), TIR: 15, PAS: Math.round(base * 0.68),
              DRI: Math.round(base * 0.45), DEF: Math.round(base * 1.08), PHY: Math.round(base * 1.02) };
  } else if (p.position === "DEF") {
    stats = { PAC: Math.round(base * 0.90), TIR: Math.round(base * 0.48), PAS: Math.round(base * 0.82),
              DRI: Math.round(base * 0.76), DEF: Math.round(base * 1.10), PHY: Math.round(base * 1.08) };
  } else if (p.position === "MIL") {
    stats = { PAC: Math.round(base * 0.90), TIR: Math.round(base * 0.80), PAS: Math.round(base * 1.05),
              DRI: Math.round(base * 0.95), DEF: Math.round(base * 0.78), PHY: Math.round(base * 0.90) };
  } else {
    stats = { PAC: Math.round(base * 1.05), TIR: Math.round(base * 1.04), PAS: Math.round(base * 0.82),
              DRI: Math.round(base * 1.02), DEF: Math.round(base * 0.40), PHY: Math.round(base * 0.90) };
  }
  return { ...p, rating: base, stats };
}

// ── Sénégal — composition probable 4-3-3 ────────────────────────────────
const SENEGAL_RAW = {
  formation: "4-3-3",
  players: [
    // GK
    { id: "mendy_16",    name: "É. Mendy",     number: 16, position: "GK",  ratingBase: 81, recentForm: [6.5, 7.0, 6.8, 7.2, 5.8] },
    // DEF
    { id: "diatta_15",   name: "K. Diatta",    number: 15, position: "DEF", ratingBase: 77, recentForm: [6.8, 7.0, 7.2, 6.9, 6.7] },
    { id: "koulibaly_3", name: "Koulibaly",    number:  3, position: "DEF", ratingBase: 82, recentForm: [7.5, 7.8, 7.2, 8.0, 6.2] },
    { id: "niakhate_19", name: "M. Niakhaté",  number: 19, position: "DEF", ratingBase: 79, recentForm: [7.0, 7.2, 7.5, 6.8, 6.0] },
    { id: "diouf_25",    name: "E. Diouf",     number: 25, position: "DEF", ratingBase: 76, recentForm: [7.1, 7.3, 7.0, 7.5, 6.5] },
    // MIL
    { id: "gueye_5",     name: "I. Gueye",     number:  5, position: "MIL", ratingBase: 76, recentForm: [6.5, 6.9, 6.8, 7.1, 6.3] },
    { id: "camara_8",    name: "L. Camara",    number:  8, position: "MIL", ratingBase: 80, recentForm: [8.2, 7.9, 8.5, 8.0, 7.1] },
    { id: "gueye_26",    name: "P. Gueye",     number: 26, position: "MIL", ratingBase: 77, recentForm: [7.0, 7.2, 7.1, 7.4, 6.6] },
    // ATT
    { id: "sarr_18",     name: "I. Sarr",      number: 18, position: "ATT", ratingBase: 82, recentForm: [7.0, 6.8, 7.4, 7.1, 6.5] },
    { id: "jackson_11",  name: "N. Jackson",   number: 11, position: "ATT", ratingBase: 81, recentForm: [7.2, 7.5, 6.8, 7.8, 6.4] },
    { id: "mane_10",     name: "S. Mané",      number: 10, position: "ATT", ratingBase: 83, recentForm: [7.5, 8.0, 7.2, 8.4, 6.9] },
  ],
  bench: [
    { id: "ndiaye_13",   name: "I. Ndiaye",    number: 13, position: "ATT", ratingBase: 77, recentForm: [7.0, 7.2, 6.9, 7.3, 7.0] },
    { id: "mbaye_20",    name: "I. Mbaye",     number: 20, position: "ATT", ratingBase: 74, recentForm: [6.8, 7.0, 7.2, 6.5, 7.5] },
    { id: "sarr_17",     name: "P.M. Sarr",    number: 17, position: "MIL", ratingBase: 78, recentForm: [7.2, 7.0, 7.1, 7.3, 6.8] },
    { id: "diarra_21",   name: "H. Diarra",    number: 21, position: "MIL", ratingBase: 76, recentForm: [7.0, 7.1, 6.8, 6.9, 7.2] },
    { id: "jakobs_14",   name: "I. Jakobs",    number: 14, position: "DEF", ratingBase: 76, recentForm: [6.9, 6.8, 7.0, 7.1, 6.5] },
  ],
};

// ── Norvège — composition probable 4-3-3 ─────────────────────────────────
const NORWAY_RAW = {
  formation: "4-3-3",
  players: [
    { id: "nyland_1",      name: "Ø. Nyland",      number:  1, position: "GK",  ratingBase: 76 },
    { id: "ryerson_14",    name: "J. Ryerson",      number: 14, position: "DEF", ratingBase: 80 },
    { id: "ajer_6",        name: "K. Ajer",         number:  6, position: "DEF", ratingBase: 80 },
    { id: "ostigard_4",    name: "L. Østigård",     number:  4, position: "DEF", ratingBase: 78 },
    { id: "wolfe_2",       name: "D. Wolfe",        number:  2, position: "DEF", ratingBase: 74 },
    { id: "berge_8",       name: "S. Berge",        number:  8, position: "MIL", ratingBase: 82 },
    { id: "thorstvedt_16", name: "K. Thorstvedt",   number: 16, position: "MIL", ratingBase: 76 },
    { id: "odegaard_10",   name: "M. Ødegaard",     number: 10, position: "MIL", ratingBase: 88 },
    { id: "nusa_7",        name: "A. Nusa",         number:  7, position: "ATT", ratingBase: 80 },
    { id: "haaland_9",     name: "E. Haaland",      number:  9, position: "ATT", ratingBase: 92 },
    { id: "sorloth_11",    name: "A. Sørloth",      number: 11, position: "ATT", ratingBase: 82 },
  ],
  bench: [],
};

// Exporter les données converties au format match-engine
export const SENEGAL_MATCH = {
  ...SENEGAL_RAW,
  players: SENEGAL_RAW.players.map(toEnginePlayer),
  bench:   SENEGAL_RAW.bench.map(toEnginePlayer),
};

export const NORWAY_MATCH = {
  ...NORWAY_RAW,
  players: NORWAY_RAW.players.map(toEnginePlayer),
};

// ── Événements scénarisés du match Sénégal-Norvège ───────────────────────
// Basés sur la forme réelle des joueurs et les scénarios probables du match.
// prob : probabilité de base de l'événement (modifiée par la tactique choisie)
// tacticsModifier : bonus/malus selon le style tactique de l'utilisateur
//   - attMult : multiplicateur si tactique offensive (attack/press)
//   - defMult : multiplicateur si tactique défensive (defense/balanced)

// src/data/matchData.js

// Petite fonction utilitaire interne pour trouver un joueur par poste de manière résiliente
// src/data/matchData.js

function getPlayerByRole(players, position, fallbackName) {
  const found = players.find(p => p.position === position);
  return found ? found.name : fallbackName;
}

export const SCRIPTED_EVENTS = [
  // ── PREMIÈRE MI-TEMPS ───────────────────────────────────────────────
  {
    id: "sarr_alert",
    minute: [16, 22],
    half: 1,
    team: "sen",
    type: "shot", // Génère 1 tir, 1 cadré
    playerFn: (lineup) => getPlayerByRole(lineup, "ATT", "I. Sarr"),
    descFn: (lineup) => {
      const sarr = getPlayerByRole(lineup, "ATT", "I. Sarr");
      const bu = getPlayerByRole(lineup, "ATT", "N. Jackson");
      return `${sarr} humilie Meling sur le côté droit et centre fort. ${bu} coupe au premier poteau, mais Nyland détourne miraculeusement !`;
    },
    prob: 0.80,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.45 }, norvege: { tirs: 0, cadres: 0, xg: 0 } }
  },
  {
    id: "haaland_goal_fixed",
    minute: [28, 33],
    half: 1,
    team: "nor",
    player: "E. Haaland",
    type: "goal", // 1 tir, 1 cadré, 1 but pour l'IA
    descFn: () => "But de la Norvège. Récupération haute d'Aursnes, Ødegaard glisse à Haaland dans l'intervalle qui décoche une frappe croisée clinique.",
    prob: 0.70,
    stats: { senegal: { tirs: 0, cadres: 0, xg: 0 }, norvege: { tirs: 1, cadres: 1, xg: 0.60 } }
  },
  {
    // Remplacement de l'ancien carton de Koulibaly par celui du scénario
    id: "koulibaly_yellow_shift",
    minute: [35, 42],
    half: 1,
    team: "sen",
    type: "yellow",
    playerFn: (lineup) => getPlayerByRole(lineup, "DEF", "Koulibaly"),
    descFn: (lineup) => {
      const def = getPlayerByRole(lineup, "DEF", "Koulibaly");
      return `Gros duel physique. ${def} s'impose magistralement devant Haaland mais est rappelé à l'ordre par l'arbitre.`;
    },
    prob: 0.65,
    stats: { senegal: { jaunes: 1 }, norvege: {} }
  },

  // ── DEUXIÈME MI-TEMPS ───────────────────────────────────────────────
  {
    id: "jackson_equalizer",
    minute: [52, 58],
    half: 2,
    team: "sen",
    type: "goal", // 1 tir, 1 cadré, 1 but pour le Sénégal
    playerFn: (lineup) => getPlayerByRole(lineup, "ATT", "N. Jackson"),
    descFn: (lineup) => {
      const bu = getPlayerByRole(lineup, "ATT", "N. Jackson");
      const sarr = getPlayerByRole(lineup, "ATT", "I. Sarr");
      return `BUT SÉNÉGAL ! Transition verticale d'école. Lamine Camara oriente vers ${sarr} qui dépose la défense. Son centre tendu trouve ${bu} qui conclut de près !`;
    },
    prob: 0.95, // Presque garanti pour le storytelling
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.75 }, norvege: { tirs: 0, cadres: 0, xg: 0 } }
  },
  {
    id: "mendy_heroic_save",
    minute: [75, 82],
    half: 2,
    team: "nor",
    player: "A. Jere",
    type: "save", // 1 tir, 1 cadré pour la Norvège, 1 parade pour Mendy
    descFn: (lineup) => {
      const gk = getPlayerByRole(lineup, "GK", "É. Mendy");
      return `Parade de grande classe ! Corner d'Ødegaard, reprise de la tête d'Ajer, mais ${gk} se détend magnifiquement sur sa ligne !`;
    },
    prob: 0.75,
    stats: { senegal: { parades: 1 }, norvege: { tirs: 1, cadres: 1, xg: 0.35 } }
  }
];

// Ne change pas la signature de ta fonction, mets juste à jour la résolution des stats
export function getScriptedEventsForHalf(half, tacticId, senegalPlayers) {
  const triggered = [];
  const usedMinutes = new Set();

  SCRIPTED_EVENTS
    .filter(e => e.half === half)
    .forEach(event => {
      const prob = event.prob; 
      if (Math.random() >= prob) return;

      const [minA, minB] = event.minute;
      let minute = minA + Math.floor(Math.random() * (minB - minA + 1));
      while (usedMinutes.has(minute) && minute < minB) minute++;
      usedMinutes.add(minute);

      const resolvedPlayer = event.playerFn ? event.playerFn(senegalPlayers) : (event.player || "Joueur");
      const resolvedDesc = event.descFn ? event.descFn(senegalPlayers) : "";

      triggered.push({
        ...event,
        minute,
        player: resolvedPlayer,
        desc: resolvedDesc,
        // On exporte les stats de l'évènement pour que Simulator.jsx puisse les additionner
        rawStats: event.stats || {} 
      });
    });

  return triggered.sort((a, b) => a.minute - b.minute);
}

// Fonction pour résoudre si un événement scénarisé se déclenche
// selon la tactique choisie par l'utilisateur
export function resolveScriptedEvent(event, tacticId) {
  const prob = event.tacticsModifier?.[tacticId] ?? event.prob;
  return Math.random() < prob;
}


