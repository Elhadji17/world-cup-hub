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
// matchData_2.js

// matchData_2.js

function getPlayerByRole(players, position, fallbackName) {
  const found = players.find(p => p.position === position);
  return found ? found.name : fallbackName;
}

// ── 1. BANQUE D'ACTIONS PAR PROFIL TACTIQUE ───────────────────────

const OFFENSIVE_EVENTS = [
  {
    id: "off_wing_destruction",
    minute: [12, 18],
    half: 1,
    team: "sen",
    type: "shot",
    descFn: (lineup, form) => `Grâce au surnombre offensif de votre ${form}, Sadio Mané repique dans l'axe et s'appuie sur Lamine Camara. Sa frappe enroulée rase le poteau de Nyland !`,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.35 }, norvege: {} }
  },
  {
    id: "off_high_risk",
    minute: [24, 29],
    half: 1,
    team: "nor",
    type: "goal", // Sanction du bloc haut
    descFn: (lineup, form) => `Risque de votre tactique ultra-offensive : Votre bloc est très haut. Sur un contre éclair, Ødegaard lance Haaland qui gagne son face-à-face avec Mendy.`,
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 1, xg: 0.65 } }
  },
  {
    id: "off_total_pressure",
    minute: [65, 71],
    half: 2,
    team: "sen",
    type: "corner",
    descFn: (lineup, form) => `Le Sénégal étouffe la Norvège dans ses 16 mètres. Le pressing imposé par votre ${form} force Ostigard à concéder trois corners consécutifs.`,
    stats: { senegal: { tirs: 2, cadres: 0, xg: 0.15 }, norvege: {} }
  }
];

const DEFENSIVE_EVENTS = [
  {
    id: "def_bus_parked",
    minute: [10, 16],
    half: 1,
    team: "sen",
    type: "save",
    descFn: (lineup, form) => `Votre ${form} ultra-compacte ne laisse aucun espace. Haaland tente de décrocher mais il est encerclé par trois défenseurs. Sa frappe lointaine est captée sans problème.`,
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 1, xg: 0.08 } }
  },
  {
    id: "def_counter_attack",
    minute: [32, 38],
    half: 1,
    team: "sen",
    type: "shot",
    descFn: (lineup) => `Contre-attaque éclair ! En récupérant le ballon très bas, Ismaila Sarr profite de l'espace, remonte 40 mètres et décoche une frappe lourde boxée en corner.`,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.40 }, norvege: {} }
  },
  {
    id: "def_clean_masterclass",
    minute: [72, 78],
    half: 2,
    team: "nor",
    type: "miss",
    descFn: (lineup) => `Le plan défensif est parfait. Kalidou Koulibaly coupe absolument toutes les trajectoires de centres norvégiens. Le public applaudit la rigueur tactique.`,
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 0, xg: 0.10 } }
  }
];

const BALANCED_EVENTS = [
  {
    id: "mid_battle",
    minute: [15, 22],
    half: 1,
    team: "neutral",
    type: "header",
    descFn: (lineup, form) => `Gros combat tactique. Votre ${form} permet un équilibre parfait au milieu. Pape Gueye et Sander Berge se livrent un duel féroce pour le contrôle du ballon.`,
    stats: { senegal: {}, norvege: {} }
  },
  {
    id: "nor_star_flash",
    minute: [30, 35],
    half: 1,
    team: "nor",
    type: "goal",
    descFn: () => `Éclat de génie norvégien. Sur une phase de possession lente, Ødegaard trouve une faille millimétrée pour Haaland qui se retourne instantanément et marque d'un tir puissant.`,
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 1, xg: 0.50 } }
  },
  {
    id: "sen_build_up",
    minute: [55, 62],
    half: 2,
    team: "sen",
    type: "shot",
    descFn: (lineup) => `Une séquence de 12 passes consécutives du Sénégal. Nicolas Jackson sert Sadio Mané à l'entrée de la surface, mais son tir enveloppé passe juste au-dessus.`,
    stats: { senegal: { tirs: 1, cadres: 0, xg: 0.25 }, norvege: {} }
  }
];

// Actions communes (Incontournables comme le coup d'envoi ou le but égalisateur)
const CORE_EVENTS = [
  {
    id: "match_start", minute: [1, 4], half: 1, team: "neutral", type: "header",
    descFn: (lineup, form) => `Coup d'envoi ! Le Sénégal s'organise en ${form}. Les consignes tactiques sont claires, le match commence avec beaucoup d'intensité.`,
    stats: {}
  },
  {
    id: "jackson_equalizer",
    minute: [50, 54],
    half: 2,
    team: "sen",
    type: "goal",
    descFn: (lineup) => `BUT POUR LE SÉNÉGAL ! Magnifique mouvement collectif. Lamine Camara transperce le milieu et sert Nicolas Jackson qui ajuste Nyland d'un plat du pied sécurité ! Égalisation !`,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.70 }, norvege: {} }
  }
];

// ── 2. FONCTION DE GÉNÉRATION DYNAMIQUE SELON LA FORMATION ───────

export function getScriptedEventsForHalf(half, tacticId, senegalPlayers, formation) {
  let dynamicPool = [...CORE_EVENTS];

  // Détermination du style selon la formation sélectionnée
  // Formations Offensives
  if (["4-3-3", "4-2-3-1"].includes(formation)) {
    dynamicPool = [...dynamicPool, ...OFFENSIVE_EVENTS];
  } 
  // Formations Défensives / Contre
  else if (["5-3-2", "5-4-1", "3-5-2"].includes(formation)) {
    dynamicPool = [...dynamicPool, ...DEFENSIVE_EVENTS];
  } 
  // Formations Équilibrées
  else {
    dynamicPool = [...dynamicPool, ...BALANCED_EVENTS];
  }

  const triggered = [];
  const usedMinutes = new Set();

  dynamicPool
    .filter(e => e.half === half)
    .forEach(event => {
      const [minA, minB] = event.minute;
      let minute = minA + Math.floor(Math.random() * (minB - minA + 1));
      while (usedMinutes.has(minute) && minute < minB) minute++;
      usedMinutes.add(minute);

      const resolvedDesc = event.descFn ? event.descFn(senegalPlayers, formation) : "";

      triggered.push({
        ...event,
        minute,
        desc: resolvedDesc,
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


