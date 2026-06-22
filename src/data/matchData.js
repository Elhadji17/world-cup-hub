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

export const SCRIPTED_EVENTS = [
  // ── HAALAND — danger permanent, surtout 1ère mi-temps ───────────────
  {
    id:      "haaland_goal_1",
    minute:  [28, 38],
    half:    1,
    team:    "nor",
    player:  "Haaland",
    type:    "goal",
    desc:    "Combinaison Ødegaard→Haaland dans l'intervalle. Frappe croisée.",
    prob:    0.55, // 55% de base
    tacticsModifier: { attack: 0.35, press: 0.40, balanced: 0.55, defense: 0.70 },
  },
  {
    id:      "haaland_goal_2",
    minute:  [72, 82],
    half:    2,
    team:    "nor",
    player:  "Haaland",
    type:    "goal",
    desc:    "Tête sur corner d'Ødegaard. Imparable.",
    prob:    0.45,
    tacticsModifier: { attack: 0.28, press: 0.35, balanced: 0.45, defense: 0.62 },
  },
  {
    id:      "haaland_miss",
    minute:  [15, 25],
    half:    1,
    team:    "nor",
    player:  "Haaland",
    type:    "miss",
    desc:    "Haaland au point de penalty, tête qui frôle le montant.",
    prob:    0.75, // très probable — il sera dangereux
    tacticsModifier: { attack: 0.50, press: 0.55, balanced: 0.75, defense: 0.88 },
  },

  // ── ØDEGAARD — créateur principal ───────────────────────────────────
  {
    id:      "odegaard_save",
    minute:  [35, 45],
    half:    1,
    team:    "nor",
    player:  "Ødegaard",
    type:    "save",
    desc:    "Frappe enroulée d'Ødegaard, Mendy sort une parade décisive.",
    prob:    0.65,
    tacticsModifier: { attack: 0.40, press: 0.45, balanced: 0.65, defense: 0.78 },
  },

  // ── MANÉ — dernière CdM, motivé ─────────────────────────────────────
  {
    id:      "mane_miss",
    minute:  [42, 47],
    half:    1,
    team:    "sen",
    player:  "Mané",
    type:    "miss",
    desc:    "Mané élimine Ryerson, centre tendu — Jackson coupe mais Nyland détourne.",
    prob:    0.70,
    tacticsModifier: { attack: 0.85, press: 0.80, balanced: 0.70, defense: 0.55 },
  },
  {
    id:      "mane_goal",
    minute:  [58, 70],
    half:    2,
    team:    "sen",
    player:  "Mané",
    type:    "goal",
    desc:    "Contre-attaque éclair ! Mané lancé en profondeur, frappe du droit.",
    prob:    0.28, // moins probable mais possible
    tacticsModifier: { attack: 0.42, press: 0.38, balanced: 0.28, defense: 0.18 },
  },

  // ── JACKSON — finisseur en forme ────────────────────────────────────
  {
    id:      "jackson_goal",
    minute:  [52, 62],
    half:    2,
    team:    "sen",
    player:  "Jackson",
    type:    "goal",
    desc:    "Transition verticale, Camara lance Mbaye, centre tendu — Jackson au second poteau !",
    prob:    0.40,
    tacticsModifier: { attack: 0.58, press: 0.52, balanced: 0.40, defense: 0.25 },
  },
  {
    id:      "jackson_miss",
    minute:  [30, 40],
    half:    1,
    team:    "sen",
    player:  "Jackson",
    type:    "miss",
    desc:    "Jackson se retourne dans la surface, frappe croisée — Nyland repousse.",
    prob:    0.60,
    tacticsModifier: { attack: 0.75, press: 0.70, balanced: 0.60, defense: 0.45 },
  },

  // ── MBAYE — pépite du PSG, entrant ou titulaire ─────────────────────
  {
    id:      "mbaye_corner",
    minute:  [55, 68],
    half:    2,
    team:    "sen",
    player:  "I. Mbaye",
    type:    "corner",
    desc:    "Mbaye déborde sur le côté droit, obligé de centrer — corner obtenu.",
    prob:    0.72,
    tacticsModifier: { attack: 0.85, press: 0.80, balanced: 0.72, defense: 0.55 },
  },

  // ── KOULIBALY — carton jaune probable sous pression ─────────────────
  {
    id:      "koulibaly_yellow",
    minute:  [35, 50],
    half:    1,
    team:    "sen",
    player:  "Koulibaly",
    type:    "yellow",
    desc:    "Tacle tardif de Koulibaly sur Haaland. Carton jaune inévitable.",
    prob:    0.60,
    tacticsModifier: { attack: 0.70, press: 0.75, balanced: 0.60, defense: 0.45 },
  },

  // ── MENDY — parade clé en 2e mi-temps ───────────────────────────────
  {
    id:      "mendy_save",
    minute:  [62, 75],
    half:    2,
    team:    "nor",
    player:  "Nusa",
    type:    "save",
    desc:    "Nusa accélère, frappe en force — Mendy sort une parade décisive !",
    prob:    0.68,
    tacticsModifier: { attack: 0.50, press: 0.55, balanced: 0.68, defense: 0.80 },
  },
];

// Fonction pour résoudre si un événement scénarisé se déclenche
// selon la tactique choisie par l'utilisateur
export function resolveScriptedEvent(event, tacticId) {
  const prob = event.tacticsModifier?.[tacticId] ?? event.prob;
  return Math.random() < prob;
}

// Génère les événements scénarisés d'une mi-temps selon la tactique
export function getScriptedEventsForHalf(half, tacticId) {
  const triggered = [];
  const usedMinutes = new Set();

  SCRIPTED_EVENTS
    .filter(e => e.half === half)
    .forEach(event => {
      if (!resolveScriptedEvent(event, tacticId)) return;
      const [minA, minB] = event.minute;
      // Choisir une minute aléatoire dans la fourchette
      let minute = minA + Math.floor(Math.random() * (minB - minA + 1));
      while (usedMinutes.has(minute) && minute < minB) minute++;
      usedMinutes.add(minute);
      triggered.push({ ...event, minute, resolvedMinute: minute });
    });

  return triggered.sort((a, b) => a.minute - b.minute);
}
