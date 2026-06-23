// src/data/matchData.js
// Vraies compositions Sénégal vs Norvège — Coupe du Monde 2026
// + événements scénarisés avec descriptions narratives selon formation et tactique

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

// ── Sénégal ──────────────────────────────────────────────────────────────
const SENEGAL_RAW = {
  formation: "4-3-3",
  players: [
    { id: "mendy_16",    name: "É. Mendy",    number: 16, position: "GK",  ratingBase: 81, recentForm: [6.5, 7.0, 6.8, 7.2, 5.8] },
    { id: "diatta_15",   name: "K. Diatta",   number: 15, position: "DEF", ratingBase: 77, recentForm: [6.8, 7.0, 7.2, 6.9, 6.7] },
    { id: "koulibaly_3", name: "Koulibaly",   number:  3, position: "DEF", ratingBase: 82, recentForm: [7.5, 7.8, 7.2, 8.0, 6.2] },
    { id: "niakhate_19", name: "M. Niakhaté", number: 19, position: "DEF", ratingBase: 79, recentForm: [7.0, 7.2, 7.5, 6.8, 6.0] },
    { id: "diouf_25",    name: "E. Diouf",    number: 25, position: "DEF", ratingBase: 76, recentForm: [7.1, 7.3, 7.0, 7.5, 6.5] },
    { id: "gueye_5",     name: "I. Gueye",    number:  5, position: "MIL", ratingBase: 76, recentForm: [6.5, 6.9, 6.8, 7.1, 6.3] },
    { id: "camara_8",    name: "L. Camara",   number:  8, position: "MIL", ratingBase: 80, recentForm: [8.2, 7.9, 8.5, 8.0, 7.1] },
    { id: "gueye_26",    name: "P. Gueye",    number: 26, position: "MIL", ratingBase: 77, recentForm: [7.0, 7.2, 7.1, 7.4, 6.6] },
    { id: "sarr_18",     name: "I. Sarr",     number: 18, position: "ATT", ratingBase: 82, recentForm: [7.0, 6.8, 7.4, 7.1, 6.5] },
    { id: "jackson_11",  name: "N. Jackson",  number: 11, position: "ATT", ratingBase: 81, recentForm: [7.2, 7.5, 6.8, 7.8, 6.4] },
    { id: "mane_10",     name: "S. Mané",     number: 10, position: "ATT", ratingBase: 83, recentForm: [7.5, 8.0, 7.2, 8.4, 6.9] },
  ],
  bench: [
    { id: "ndiaye_13",  name: "I. Ndiaye",  number: 13, position: "ATT", ratingBase: 77, recentForm: [7.0, 7.2, 6.9, 7.3, 7.0] },
    { id: "mbaye_20",   name: "I. Mbaye",   number: 20, position: "ATT", ratingBase: 74, recentForm: [6.8, 7.0, 7.2, 6.5, 7.5] },
    { id: "sarr_17",    name: "P.M. Sarr",  number: 17, position: "MIL", ratingBase: 78, recentForm: [7.2, 7.0, 7.1, 7.3, 6.8] },
    { id: "diarra_21",  name: "H. Diarra",  number: 21, position: "MIL", ratingBase: 76, recentForm: [7.0, 7.1, 6.8, 6.9, 7.2] },
    { id: "jakobs_14",  name: "I. Jakobs",  number: 14, position: "DEF", ratingBase: 76, recentForm: [6.9, 6.8, 7.0, 7.1, 6.5] },
  ],
};

// ── Norvège ───────────────────────────────────────────────────────────────
const NORWAY_RAW = {
  formation: "4-3-3",
  players: [
    { id: "nyland_1",      name: "Ø. Nyland",    number:  1, position: "GK",  ratingBase: 76 },
    { id: "ryerson_14",    name: "J. Ryerson",    number: 14, position: "DEF", ratingBase: 80 },
    { id: "ajer_6",        name: "K. Ajer",       number:  6, position: "DEF", ratingBase: 80 },
    { id: "ostigard_4",    name: "L. Østigård",   number:  4, position: "DEF", ratingBase: 78 },
    { id: "wolfe_2",       name: "D. Wolfe",      number:  2, position: "DEF", ratingBase: 74 },
    { id: "berge_8",       name: "S. Berge",      number:  8, position: "MIL", ratingBase: 82 },
    { id: "thorstvedt_16", name: "K. Thorstvedt", number: 16, position: "MIL", ratingBase: 76 },
    { id: "odegaard_10",   name: "M. Ødegaard",   number: 10, position: "MIL", ratingBase: 88 },
    { id: "nusa_7",        name: "A. Nusa",       number:  7, position: "ATT", ratingBase: 80 },
    { id: "haaland_9",     name: "E. Haaland",    number:  9, position: "ATT", ratingBase: 92 },
    { id: "sorloth_11",    name: "A. Sørloth",    number: 11, position: "ATT", ratingBase: 82 },
  ],
  bench: [],
};

export const SENEGAL_MATCH = {
  ...SENEGAL_RAW,
  players: SENEGAL_RAW.players.map(toEnginePlayer),
  bench:   SENEGAL_RAW.bench.map(toEnginePlayer),
};

export const NORWAY_MATCH = {
  ...NORWAY_RAW,
  players: NORWAY_RAW.players.map(toEnginePlayer),
};

// ── Banques d'événements scénarisés ─────────────────────────────────────
// Chaque événement a : minute, type, team ("me"=Sénégal, "ai"=Norvège), player, desc
// team "text" = commentaire narratif sans équipe précise

const EVENTS_1ST_OFFENSIVE = [
  { minute:  3, type: "text",   team: "me",  player: "Mané",      desc: "Le Sénégal démarre pied au plancher. Bloc très haut, Sadio Mané réclame le ballon en profondeur dès les premières secondes." },
  { minute:  9, type: "shot",   team: "me",  player: "L. Camara", desc: "Première étincelle ! Combinaison Jackson-Camara à l'entrée de la surface. Frappe tendue de Camara qui rase le montant droit !" },
  { minute: 14, type: "text",   team: "ai",  player: "Berge",     desc: "Risque tactique : le milieu norvégien profite d'un contre. Berge s'engouffre dans l'espace laissé libre mais sa passe est trop longue." },
  { minute: 21, type: "corner", team: "me",  player: "I. Sarr",   desc: "Ismaïla Sarr provoque Meling sur le couloir droit, déborde et centre fort. Corner obtenu après déviation d'Ajer !" },
  { minute: 27, type: "header", team: "me",  player: "Koulibaly", desc: "Sur le corner, Koulibaly s'élève plus haut que tout le monde ! Sa tête piquée est repoussée sur sa ligne par Nyland — quelle occasion !" },
  { minute: 33, type: "goal",   team: "ai",  player: "E. Haaland", desc: "⚡ BUT POUR LA NORVÈGE. Pris au piège de son propre pressing haut, P. Gueye perd le ballon. Ødegaard lance Haaland à la limite du hors-jeu — plat du pied glacial. (0-1)" },
  { minute: 39, type: "yellow", team: "me",  player: "Koulibaly", desc: "Tension sur le terrain. Koulibaly écope d'un carton jaune après une charge appuyée sur Haaland." },
  { minute: 44, type: "miss",   team: "me",  player: "S. Mané",   desc: "Mané tente l'exploit individuel avant la pause mais se heurte au double rideau défensif norvégien. Le ballon file en sortie de but." },
];

const EVENTS_1ST_DEFENSIVE = [
  { minute:  4, type: "text",   team: "me",  player: "",          desc: "Plan clair : rideau de fer. Le Sénégal s'installe dans un bloc ultra-compact. La Norvège fait tourner sans trouver de faille." },
  { minute: 11, type: "save",   team: "ai",  player: "É. Mendy",  desc: "Haaland décroche et décoche une frappe lointaine et soudaine — Édouard Mendy veille et capte en deux temps. Parade solide !" },
  { minute: 18, type: "text",   team: "me",  player: "",          desc: "Masterclass tactique. Le milieu coulisse à la perfection. Ødegaard montre des signes de frustration face au marquage individuel." },
  { minute: 25, type: "shot",   team: "me",  player: "I. Sarr",   desc: "Contre-attaque éclair ! Sarr récupère haut et remonte 40 mètres. Frappe à l'entrée de la surface — juste au-dessus !" },
  { minute: 32, type: "goal",   team: "ai",  player: "E. Haaland", desc: "⚡ BUT POUR LA NORVÈGE. Exploit d'Ødegaard qui élimine deux joueurs d'un double contact magique et glisse pour Haaland. Imparable. (0-1)" },
  { minute: 38, type: "text",   team: "me",  player: "",          desc: "Le Sénégal ne panique pas et conserve sa structure rigoureuse malgré le score. Pas question de se découvrir maintenant." },
  { minute: 43, type: "corner", team: "ai",  player: "Ødegaard",  desc: "Corner concédé par Niakhaté après un centre dangereux de Ryerson. La défense repousse le danger de la tête." },
];

const EVENTS_1ST_BALANCED = [
  { minute:  3, type: "text",   team: "me",  player: "",          desc: "Début équilibré. Le Sénégal prend le contrôle du rythme, cherchant à construire patiemment depuis l'arrière." },
  { minute: 10, type: "text",   team: "me",  player: "P. Gueye",  desc: "Gros duel au milieu. Pape Gueye s'impose physiquement face à Sander Berge. Le ton est donné." },
  { minute: 17, type: "shot",   team: "me",  player: "S. Mané",   desc: "Séquence de possession. Camara trouve Mané dans l'intervalle — frappe en pivot captée par Nyland." },
  { minute: 24, type: "text",   team: "ai",  player: "A. Nusa",   desc: "La Norvège réplique. Nusa accélère sur l'aile gauche mais Diatta intervient proprement d'un tacle glissé impeccable." },
  { minute: 31, type: "goal",   team: "ai",  player: "E. Haaland", desc: "⚡ BUT POUR LA NORVÈGE. Perte de balle évitable au milieu — Ødegaard sert Haaland dans la surface qui mystifie Mendy d'une frappe puissante. (0-1)" },
  { minute: 37, type: "yellow", team: "ai",  player: "K. Ajer",   desc: "Carton jaune pour Ajer, coupable d'une obstruction flagrante sur Jackson qui partait en contre." },
  { minute: 42, type: "text",   team: "me",  player: "",          desc: "Le jeu se hache avant la pause. Les deux équipes commettent des fautes tactiques pour casser les rythmes." },
];

const EVENTS_2ND = [
  { minute: 47, type: "text",   team: "me",  player: "",           desc: "Le match reprend ! Les Lions reviennent avec un visage conquérant et une agressivité renforcée dans les duels." },
  { minute: 52, type: "goal",   team: "me",  player: "N. Jackson", desc: "⚽ BUT POUR LE SÉNÉGAL — L'ÉGALISATION ! Mouvement collectif orchestré par Camara qui décale Sarr, centre au cordeau pour Jackson au second poteau. Plat du pied parfait, le stade explose ! (1-1)" },
  { minute: 58, type: "text",   team: "ai",  player: "Haaland",    desc: "La Norvège accuse le coup physiquement. Les lignes scandinaves s'étirent, offrant plus d'espaces à Mané en contre." },
  { minute: 64, type: "save",   team: "me",  player: "É. Mendy",   desc: "Alerte dans la surface des Lions ! Sur coup franc d'Ødegaard, Haaland place une tête puissante — arrêt réflexe exceptionnel de Mendy !" },
  { minute: 70, type: "text",   team: "me",  player: "",           desc: "Changement tactique visible : le Sénégal accentue l'utilisation des couloirs pour étirer le bloc norvégien." },
  { minute: 75, type: "shot",   team: "me",  player: "S. Mané",    desc: "La frappe de Sadio Mané ! Il enroule depuis l'aile gauche — Nyland se détend magnifiquement pour détourner en corner." },
  { minute: 80, type: "sub",    team: "me",  player: "I. Ndiaye",  desc: "🔄 CHANGEMENT TACTIQUE : Entrée d'Iliman Ndiaye pour apporter de la fraîcheur et du dynamisme entre les lignes en fin de match." },
  { minute: 84, type: "text",   team: "me",  player: "",           desc: "Le chrono tourne. La fatigue est là mais la cohésion sénégalaise tient face aux assauts désespérés d'Haaland." },
  { minute: 88, type: "goal",   team: "me",  player: "S. Mané",    desc: "🔥 BUT HISTORIQUE DE MANÉ À LA 88e MINUTE ! Ndiaye lance Camara qui sert Sadio Mané côté gauche — frappe chirurgicale en pleine lucarne. Le Sénégal prend l'avantage ! (2-1)" },
  { minute: 92, type: "text",   team: "ai",  player: "Haaland",    desc: "Temps additionnel. La Norvège jette toutes ses forces dans la bataille — même Nyland monte sur le dernier corner !" },
  { minute: 94, type: "text",   team: "me",  player: "Koulibaly",  desc: "Interception héroïque de Koulibaly de la tête ! Le ballon est dégagé loin devant. Le Sénégal tient !" },
];

// Fonction principale exportée — retourne les événements d'une mi-temps
// selon la formation et la tactique choisies par l'utilisateur
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
  const prob = event.tacticsModifier?.[tacticId] ?? event.prob ?? 1;
  return Math.random() < prob;
}
