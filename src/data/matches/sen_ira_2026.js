// src/data/matches/sen_ira_2026.js
// Sénégal vs Irak — Groupe I · 3e journée · 26 juin 2026 · BMO Field, Toronto
// Match de survie : le Sénégal DOIT gagner pour espérer la qualification

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

// ── Sénégal — probable 4-3-3 offensif ───────────────────────────────────
// Mendy incertain (blessure), Mbaye probable titulaire après bonne entrée vs Norvège
const SENEGAL_RAW = {
  formation: "4-3-3",
  players: [
    { id: "mendy_16",    name: "É. Mendy",    number: 16, position: "GK",  ratingBase: 81, recentForm: [6.5, 7.0, 6.8, 7.2, 5.8] },
    { id: "diatta_15",   name: "K. Diatta",   number: 15, position: "DEF", ratingBase: 77, recentForm: [6.8, 7.0, 7.2, 6.9, 6.7] },
    { id: "koulibaly_3", name: "Koulibaly",   number:  3, position: "DEF", ratingBase: 82, recentForm: [7.5, 7.8, 7.2, 8.0, 5.5] }, // sorti blessé vs NOR
    { id: "niakhate_19", name: "M. Niakhaté", number: 19, position: "DEF", ratingBase: 79, recentForm: [7.0, 7.2, 7.5, 6.8, 7.0] },
    { id: "diouf_25",    name: "E. Diouf",    number: 25, position: "DEF", ratingBase: 76, recentForm: [7.1, 7.3, 7.0, 7.5, 6.8] },
    { id: "camara_8",    name: "L. Camara",   number:  8, position: "MIL", ratingBase: 80, recentForm: [8.2, 7.9, 8.5, 8.0, 7.5] }, // en grande forme
    { id: "gueye_5",     name: "I. Gueye",    number:  5, position: "MIL", ratingBase: 76, recentForm: [6.5, 6.9, 6.8, 7.1, 6.5] },
    { id: "sarr_17",     name: "P.M. Sarr",   number: 17, position: "MIL", ratingBase: 78, recentForm: [7.2, 7.0, 7.1, 7.3, 7.0] }, // probable titulaire
    { id: "mbaye_20",    name: "I. Mbaye",    number: 20, position: "ATT", ratingBase: 76, recentForm: [6.8, 7.0, 7.2, 6.5, 7.8] }, // pépite PSG, en forme
    { id: "jackson_11",  name: "N. Jackson",  number: 11, position: "ATT", ratingBase: 81, recentForm: [7.2, 7.5, 6.8, 7.8, 6.5] },
    { id: "mane_10",     name: "S. Mané",     number: 10, position: "ATT", ratingBase: 83, recentForm: [7.5, 8.0, 7.2, 8.4, 6.8] },
  ],
  bench: [
    { id: "ndiaye_13",  name: "I. Ndiaye",  number: 13, position: "ATT", ratingBase: 77, recentForm: [7.0, 7.2, 6.9, 7.3, 7.2] },
    { id: "sarr_18",    name: "I. Sarr",    number: 18, position: "ATT", ratingBase: 82, recentForm: [7.0, 6.8, 7.4, 7.1, 6.2] },
    { id: "gueye_26",   name: "P. Gueye",   number: 26, position: "MIL", ratingBase: 77, recentForm: [7.0, 7.2, 7.1, 7.4, 6.4] },
    { id: "diarra_21",  name: "H. Diarra",  number: 21, position: "MIL", ratingBase: 76, recentForm: [7.0, 7.1, 6.8, 6.9, 7.0] },
    { id: "jakobs_14",  name: "I. Jakobs",  number: 14, position: "DEF", ratingBase: 76, recentForm: [6.9, 6.8, 7.0, 7.1, 6.8] },
  ],
};

// ── Irak — 4-3-3 compact, déjà éliminé (0 pts, -4 DB) ───────────────────
// Sélectionneur : Graham Arnold. Équipe inconnue en CdM depuis 1986.
// Défaite 1-4 vs NOR, défaite 0-3 vs FRA — dos au mur mais rien à perdre
const IRAQ_RAW = {
  formation: "4-3-3",
  players: [
    { id: "ira_gk",   name: "J. Hamid",    number:  1, position: "GK",  ratingBase: 70 },
    { id: "ira_rb",   name: "A. Kadhim",   number:  2, position: "DEF", ratingBase: 67 },
    { id: "ira_cb1",  name: "A. Hatem",    number:  5, position: "DEF", ratingBase: 68 },
    { id: "ira_cb2",  name: "S. Jasim",    number:  4, position: "DEF", ratingBase: 67 },
    { id: "ira_lb",   name: "A. Saleh",    number:  3, position: "DEF", ratingBase: 66 },
    { id: "ira_cm1",  name: "A. Hussein",  number:  8, position: "MIL", ratingBase: 74 }, // buteur vs NOR
    { id: "ira_cm2",  name: "M. Jabbar",   number:  6, position: "MIL", ratingBase: 70 },
    { id: "ira_cm3",  name: "B. Ali",      number: 10, position: "MIL", ratingBase: 72 },
    { id: "ira_rw",   name: "A. Ridha",    number:  7, position: "ATT", ratingBase: 69 },
    { id: "ira_st",   name: "A. Karrar",   number:  9, position: "ATT", ratingBase: 71 },
    { id: "ira_lw",   name: "M. Dawood",   number: 11, position: "ATT", ratingBase: 68 },
  ],
  bench: [],
};

export const SENEGAL_MATCH = {
  ...SENEGAL_RAW,
  players: SENEGAL_RAW.players.map(toEnginePlayer),
  bench:   SENEGAL_RAW.bench.map(toEnginePlayer),
};

export const AWAY_MATCH = {
  ...IRAQ_RAW,
  players: IRAQ_RAW.players.map(toEnginePlayer),
};

// Alias pour compatibilité avec Simulator.jsx
export const NORWAY_MATCH = AWAY_MATCH;

// ── Contexte du match ─────────────────────────────────────────────────────
export const MATCH_CONTEXT = {
  title:       "Match de survie — Sénégal doit gagner !",
  description: "Après 2 défaites (France 3-1, Norvège 2-1), le Sénégal est dos au mur. Une victoire est impérative pour espérer la qualification via le classement des meilleurs 3es. L'Irak est déjà éliminé (0 pts) mais a montré du courage face à la Norvège (but d'Aymen Hussein).",
  urgency:     "critical", // normal | important | critical
  awayContext: "L'Irak joue sans pression — déjà éliminé, ils jouent pour l'honneur.",
};

// ── Événements scénarisés Sénégal-Irak ───────────────────────────────────

const EVENTS_1ST_OFFENSIVE = [
  { minute:  4, type: "text",   team: "me",  player: "",           desc: "Le Sénégal démarre avec une intensité maximale. C'est maintenant ou jamais — les Lions attaquent d'entrée avec un bloc très haut." },
  { minute: 10, type: "shot",   team: "me",  player: "N. Jackson", desc: "Première occasion ! Camara lance Jackson en profondeur, son tir croisé est repoussé par le gardien irakien. Corner !" },
  { minute: 15, type: "corner", team: "me",  player: "I. Mbaye",   desc: "Sur le corner d'Mbaye, Koulibaly s'élève mais sa tête passe au-dessus. L'Irak tient pour l'instant." },
  { minute: 22, type: "goal",   team: "me",  player: "S. Mané",    desc: "⚽ BUT DU SÉNÉGAL ! SADIO MANÉ OUVRE LE SCORE ! Combination parfaite Camara-Jackson, centre tendu, Mané reprend du droit au premier poteau. 53 buts en sélection ! (1-0)" },
  { minute: 31, type: "shot",   team: "me",  player: "N. Jackson", desc: "Jackson tente de faire le break depuis l'entrée de la surface. Sa frappe percutante est détournée en corner par le gardien." },
  { minute: 38, type: "text",   team: "ai",  player: "A. Hussein", desc: "Contre-attaque irakienne dangereuse. Hussein, buteur contre la Norvège, s'échappe sur le côté gauche mais Niakhaté intervient proprement." },
  { minute: 44, type: "goal",   team: "me",  player: "I. Mbaye",   desc: "⚽ DEUXIÈME BUT ! IBRAHIM MBAYE INSCRIT SON PREMIER BUT EN COUPE DU MONDE ! La pépite du PSG élimine son défenseur d'un petit pont et frappe en lucarne ! (2-0)" },
];

const EVENTS_1ST_DEFENSIVE = [
  { minute:  5, type: "text",   team: "me",  player: "",           desc: "Bloc bas sénégalais — le Sénégal préserve son énergie et attend l'Irak qui doit jouer sans pression. Attention aux contres !" },
  { minute: 12, type: "text",   team: "ai",  player: "A. Hussein", desc: "L'Irak tente de construire patiemment. Hussein s'essaie à quelques dribbles mais la défense sénégalaise est bien organisée." },
  { minute: 19, type: "shot",   team: "me",  player: "S. Mané",    desc: "Contre-attaque ! Mané reçoit un long ballon, se retourne et frappe — déviation du défenseur en corner. Belle occasion !" },
  { minute: 27, type: "goal",   team: "me",  player: "N. Jackson", desc: "⚽ BUT EN CONTRE ! Le Sénégal profite d'une sortie mal assurée de la défense irakienne. Jackson conclut d'une reprise de volée. (1-0)" },
  { minute: 35, type: "text",   team: "ai",  player: "",           desc: "L'Irak réagit et monte d'un cran. Leur manque de précision en finition sauve le Sénégal pour l'instant." },
  { minute: 42, type: "save",   team: "me",  player: "É. Mendy",   desc: "Frisson ! Tir irakien à 20 mètres — Mendy détend et repousse de la paume. Parade décisive !" },
];

const EVENTS_1ST_BALANCED = [
  { minute:  6, type: "text",   team: "me",  player: "",           desc: "Sénégal en contrôle. L'Irak tente de mettre de l'intensité mais manque de qualité technique pour inquiéter la défense." },
  { minute: 14, type: "shot",   team: "me",  player: "L. Camara",  desc: "Camara tente sa chance de loin — frappe déviée par un défenseur. Corner obtenu !" },
  { minute: 21, type: "goal",   team: "me",  player: "S. Mané",    desc: "⚽ BUT DE SADIO MANÉ ! Le capitaine se charge. Passe en profondeur de P.M. Sarr, contrôle, frappe en pivot — but magistral. (1-0)" },
  { minute: 28, type: "text",   team: "ai",  player: "",           desc: "L'Irak essaie de réagir mais leur pressing ne parvient pas à déstabiliser la construction sénégalaise." },
  { minute: 35, type: "corner", team: "me",  player: "I. Mbaye",   desc: "Mbaye obtient un corner après un débordement côté droit. Centre bien travaillé mais la défense irakienne repousse." },
  { minute: 41, type: "yellow", team: "ai",  player: "A. Hatem",   desc: "Carton jaune pour le défenseur central irakien, coupable d'une faute grossière sur Jackson en contre-attaque." },
];

const EVENTS_2ND = [
  { minute: 47, type: "text",   team: "me",  player: "",           desc: "La 2e mi-temps commence. Le Sénégal doit faire le break — un but supplémentaire serait précieux pour la différence de buts." },
  { minute: 54, type: "goal",   team: "me",  player: "N. Jackson", desc: "⚽ LE BREAK ! Jackson encore décisif ! Mbaye centre depuis la droite, Jackson reprend de la tête au deuxième poteau. Le Sénégal prend le large ! (3-0 ou 2-0 selon scénario)" },
  { minute: 61, type: "text",   team: "ai",  player: "A. Hussein", desc: "Hussein tente de redonner de l'espoir à l'Irak — sa frappe en dehors de la surface est captée proprement par Mendy." },
  { minute: 67, type: "shot",   team: "me",  player: "S. Mané",    desc: "Mané tente le doublé ! Frappe enroulée depuis l'aile gauche — Hamid détourne en corner de justesse. Quelle technique !" },
  { minute: 72, type: "sub",    team: "me",  player: "I. Sarr",    desc: "🔄 CHANGEMENT : Ismaïla Sarr entre en jeu. Le coach gère les forces et donne du temps de jeu à ses remplaçants." },
  { minute: 78, type: "goal",   team: "me",  player: "I. Ndiaye",  desc: "⚽ BUT D'ILIMAN NDIAYE ! Entré depuis le banc, il marque sur sa première action ! Frappe puissante dans la lucarne supérieure gauche. Le public de Toronto est en délire !" },
  { minute: 84, type: "text",   team: "me",  player: "",           desc: "Le Sénégal contrôle sereinement le match. Les Lions gèrent le score et surveillent les autres résultats du groupe." },
  { minute: 88, type: "text",   team: "ai",  player: "",           desc: "L'Irak pousse pour marquer un but d'honneur mais la défense sénégalaise repousse tout avec autorité." },
  { minute: 93, type: "text",   team: "me",  player: "",           desc: "Coup de sifflet final ! Le Sénégal s'impose et maintient son espoir de qualification !" },
];

export function getScriptedEventsForHalf(half, tacticId, senegalPlayers = [], formation = "4-3-3") {
  const f = formation || "4-3-3";
  let pool;

  if (half === 1) {
    if (["4-3-3", "4-2-3-1"].includes(f))   pool = EVENTS_1ST_OFFENSIVE;
    else if (["5-3-2"].includes(f))          pool = EVENTS_1ST_DEFENSIVE;
    else                                      pool = EVENTS_1ST_BALANCED;
  } else {
    pool = EVENTS_2ND;
  }

  return pool.map(e => ({ ...e, scripted: true }));
}

export function resolveScriptedEvent(event, tacticId) {
  return Math.random() < (event.prob ?? 1);
}
