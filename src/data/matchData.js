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

function getPlayerByRole(players, position, fallbackName) {
  const found = players.find(p => p.position === position);
  return found ? found.name : fallbackName;
}

export const SCRIPTED_EVENTS = [
  // ── PREMIÈRE MI-TEMPS : DUELS ET BLOC TACTIQUE ───────────────────────
  {
    id: "match_intro",
    minute: [1, 5],
    half: 1,
    team: "neutral",
    type: "header",
    descFn: (lineup, formation) => `Le coup d'envoi est donné ! Le Sénégal s'installe dans son système en ${formation}. La Norvège impose un pressing haut d'entrée de jeu.`,
    prob: 1.0,
    stats: {}
  },
  {
    id: "haaland_vs_koulibaly_1",
    minute: [8, 14],
    half: 1,
    team: "sen",
    type: "header", // Duel aérien
    playerFn: (lineup) => getPlayerByRole(lineup, "DEF", "Koulibaly"),
    descFn: (lineup) => {
      const def = getPlayerByRole(lineup, "DEF", "Koulibaly");
      return `Duel clé : Longue ouverture d'Ødegaard vers Haaland. ${def} s'impose magistralement au physique et relance proprement.`;
    },
    prob: 0.90,
    stats: { senegal: { tirs: 0 }, norvege: {} }
  },
  {
    id: "sarr_alert",
    minute: [16, 22],
    half: 1,
    team: "sen",
    type: "shot",
    playerFn: (lineup) => getPlayerByRole(lineup, "ATT", "I. Sarr"),
    descFn: (lineup) => {
      const sarr = getPlayerByRole(lineup, "ATT", "I. Sarr");
      const bu = getPlayerByRole(lineup, "ATT", "N. Jackson");
      return `Avantage Sénégal sur le couloir ! ${sarr} humilie Meling sur le côté droit grâce à sa vitesse et centre fort. ${bu} coupe au premier poteau, mais Nyland détourne !`;
    },
    prob: 0.85,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.45 }, norvege: {} }
  },
  {
    id: "formation_risk_midfield",
    minute: [23, 27],
    half: 1,
    team: "nor",
    type: "miss",
    descFn: (lineup, formation) => {
      if (formation === "4-3-3" || formation === "4-2-3-1") {
        return `Le milieu sénégalais coulisse bien. Ødegaard est encerclé par Lamine Camara et Pape Gueye, sa transmission vers Bobb finit en sortie de but.`;
      }
      return `Risque tactique : Le milieu à deux du Sénégal souffre face au trio norvégien. Berge décale Schjelderup qui frappe au-dessus.`;
    },
    prob: 0.75,
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 0, xg: 0.15 } }
  },
  {
    id: "haaland_goal_fixed",
    minute: [29, 34],
    half: 1,
    team: "nor",
    player: "E. Haaland",
    type: "goal",
    descFn: () => "But de la Norvège. Récupération haute d'Aursnes profitant d'un pressing agressif. Ødegaard glisse subtilement à Haaland dans l'intervalle qui ajuste Mendy.",
    prob: 1.0, // Événement fondateur du scénario
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 1, xg: 0.60 } }
  },
  {
    id: "koulibaly_yellow_shift",
    minute: [36, 42],
    half: 1,
    team: "sen",
    type: "yellow",
    playerFn: (lineup) => getPlayerByRole(lineup, "DEF", "Koulibaly"),
    descFn: (lineup) => {
      const def = getPlayerByRole(lineup, "DEF", "Koulibaly");
      return `Prise de risque : Haaland partait seul en transition dans le dos de la défense. ${def} commet une faute tactique nécessaire et écope d'un jaune.`;
    },
    prob: 0.80,
    stats: { senegal: { jaunes: 1 }, norvege: {} }
  },

  // ── DEUXIÈME MI-TEMPS : RESTRUCTURATION ET REMPLACEMENTS ───────────
  {
    id: "half2_start",
    minute: [46, 50],
    half: 2,
    team: "neutral",
    type: "header",
    descFn: (lineup, formation) => `Reprise du match. Les Lions reviennent avec des intentions agressives en transition verticale pour déstabiliser le bloc haut de la Norvège.`,
    prob: 1.0,
    stats: {}
  },
  {
    id: "jackson_equalizer",
    minute: [52, 58],
    half: 2,
    team: "sen",
    type: "goal",
    playerFn: (lineup) => getPlayerByRole(lineup, "ATT", "N. Jackson"),
    descFn: (lineup) => {
      const bu = getPlayerByRole(lineup, "ATT", "N. Jackson");
      const sarr = getPlayerByRole(lineup, "ATT", "I. Sarr");
      return `BUT SÉNÉGAL ! Relance propre sous pression. Lamine Camara oriente instantanément vers ${sarr} qui dépose Meling. Son centre tendu trouve ${bu} au second poteau !`;
    },
    prob: 1.0,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.75 }, norvege: {} }
  },
  {
    id: "scripted_substitution_nor",
    minute: [62, 67],
    half: 2,
    team: "nor",
    type: "miss",
    descFn: () => "Changement pour la Norvège : Fatigué par les duels avec Niakhaté, Sørloth cède sa place à un milieu supplémentaire pour densifier l'axe.",
    prob: 0.90,
    stats: {}
  },
  {
    id: "tactical_advantage_check",
    minute: [70, 74],
    half: 2,
    team: "sen",
    type: "shot",
    playerFn: (lineup) => getPlayerByRole(lineup, "ATT", "S. Mané"),
    descFn: (lineup, formation, tacticId) => {
      const mane = getPlayerByRole(lineup, "ATT", "S. Mané");
      if (tacticId === "attack" || tacticId === "press") {
        return `Le choix de l'Attaque Totale pousse la Norvège à reculer. ${mane} repique dans l'axe et tente une lourde frappe boxée par Nyland !`;
      }
      return `Le Sénégal reste discipliné dans son bloc. ${mane} combine avec Lamine Camara mais la passe finale est interceptée par Ajer.`;
    },
    prob: 0.85,
    stats: { senegal: { tirs: 1, cadres: 1, xg: 0.20 }, norvege: {} }
  },
  {
    id: "mendy_heroic_save",
    minute: [76, 82],
    half: 2,
    team: "nor",
    type: "save",
    descFn: (lineup) => {
      const gk = getPlayerByRole(lineup, "GK", "É. Mendy");
      return `Parade monumentale de ${gk} ! Sur un corner d'Ødegaard, Ajer dévie de la tête pour Haaland à bout portant. Notre gardien repousse par réflexe !`;
    },
    prob: 1.0,
    stats: { senegal: {}, norvege: { tirs: 1, cadres: 1, xg: 0.55 } }
  }
];

export function getScriptedEventsForHalf(half, tacticId, senegalPlayers, formation) {
  const triggered = [];
  const usedMinutes = new Set();

  SCRIPTED_EVENTS
    .filter(e => e.half === half)
    .forEach(event => {
      if (Math.random() >= event.prob) return;

      const [minA, minB] = event.minute;
      let minute = minA + Math.floor(Math.random() * (minB - minA + 1));
      while (usedMinutes.has(minute) && minute < minB) minute++;
      usedMinutes.add(minute);

      const resolvedPlayer = event.playerFn ? event.playerFn(senegalPlayers) : (event.player || "");
      // On passe désormais la formation et le style tactique à la description narrative
      const resolvedDesc = event.descFn ? event.descFn(senegalPlayers, formation, tacticId) : "";

      triggered.push({
        ...event,
        minute,
        player: resolvedPlayer,
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


