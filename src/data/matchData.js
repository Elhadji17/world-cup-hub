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

// ── BANQUE D'ACTIONS 1ÈRE MI-TEMPS (DÉPENDANTE DE LA FORMATION) ───────────────────────
const OFFENSIVE_1ST = [
  { minute: 3, type: "text", descFn: (l, f) => `Le Sénégal démarre pied au plancher en ${f}. Le bloc est très haut, Sadio Mané demande immédiatement le ballon dans la profondeur.` },
  { minute: 9, type: "shot", descFn: () => `Première étincelle ! Nicolas Jackson combine à l'entrée de la surface avec Lamine Camara. Ce dernier décoche une frappe tendue qui rase le montant droit !` },
  { minute: 14, type: "text", descFn: () => `Risque tactique : Le milieu norvégien profite d'un contre. Sander Berge s'engouffre dans l'espace laissé libre par votre bloc offensif, mais sa passe est trop longue.` },
  { minute: 21, type: "corner", descFn: () => `Ismaïla Sarr provoque Meling sur le côté droit, déborde et centre fort. C'est contré en corner par Ajer. Le public pousse !` },
  { minute: 27, type: "shot", descFn: () => `Quelle occasion ! Sur le corner, Kalidou Koulibaly s'élève plus haut que tout le monde mais sa tête piquée est bloquée sur sa ligne par Nyland !` },
  { minute: 33, type: "goal", descFn: () => `⚡ BUT POUR LA NORVÈGE ! Sanction immédiate. Pris au piège de votre propre pressing haut, Pape Gueye perd le ballon au milieu. Martin Ødegaard lance Erling Haaland à la limite du hors-jeu, qui ajuste Édouard Mendy d'un plat du pied glacial. (0-1)` },
  { minute: 39, type: "yellow", descFn: () => `Tension sur le terrain. Kalidou Koulibaly écope d'un carton jaune après une charge appuyée sur Haaland pour couper une nouvelle transition rapide.` },
  { minute: 44, type: "text", descFn: () => `Le Sénégal pousse avant la pause. Sadio Mané tente un exploit individuel mais se heurte au double rideau défensif norvégien.` }
];

const DEFENSIVE_1ST = [
  { minute: 4, type: "text", descFn: (l, f) => `Le plan est clair : rideau de fer. Le Sénégal s'installe dans un ${f} ultra-compact. La Norvège fait tourner le ballon sans trouver de faille.` },
  { minute: 11, type: "save", descFn: () => `Erling Haaland tente de décrocher pour aspirer la défense. Il décoche une frappe lointaine et soudaine, mais Édouard Mendy veille et capte en deux temps.` },
  { minute: 18, type: "text", descFn: () => `Masterclass tactique pour le moment. Votre milieu coulisse à la perfection. Martin Ødegaard montre des signes de frustration face au marquage individuel.` },
  { minute: 25, type: "shot", descFn: () => `Contre-attaque éclair ! Ismaïla Sarr profite d'un ballon récupéré très bas pour remonter 40 mètres. Il tente sa chance à l'entrée de la surface, ça passe juste au-dessus !` },
  { minute: 32, type: "goal", descFn: () => `⚡ BUT POUR LA NORVÈGE. Sur un exploit individuel, Martin Ødegaard élimine deux joueurs d'un double contact magique et glisse le ballon dans la course d'Haaland qui ne pardonne pas. (0-1)` },
  { minute: 38, type: "text", descFn: () => `Le Sénégal ne panique pas et conserve sa structure rigoureuse malgré le score. Pas question de se découvrir maintenant.` },
  { minute: 43, type: "corner", descFn: () => `Corner concédé par Moussa Niakhaté après un centre dangereux de Ryerson. La défense repousse le danger de la tête.` }
];

const BALANCED_1ST = [
  { minute: 3, type: "text", descFn: (l, f) => `Début de match équilibré. Le Sénégal prend le contrôle du rythme en ${f}, cherchant à construire patiemment depuis l'arrière.` },
  { minute: 10, type: "text", descFn: () => `Gros duel au milieu de terrain. Pape Gueye s'impose physiquement face à Sander Berge. Le ton de ce match est donné.` },
  { minute: 17, type: "shot", descFn: () => `Séquence de possession intéressante pour les Lions. Lamine Camara trouve Sadio Mané dans l'intervalle, sa frappe en pivot est captée par Nyland.` },
  { minute: 24, type: "text", descFn: () => `La Norvège réplique. Antonio Nusa accélère sur l'aile gauche mais Abdou Diallo intervient proprement d'un tacle glissé impeccable.` },
  { minute: 31, type: "goal", descFn: () => `⚡ BUT POUR LA NORVÈGE ! Une perte de balle évitable au milieu profite aux Scandinaves. Ødegaard sert Haaland dans la surface qui mystifie Mendy d'une frappe puissante sous la barre. (0-1)` },
  { minute: 37, type: "yellow", descFn: () => `Carton jaune pour la Norvège (Ajer) coupable d'une obstruction flagrante sur Nicolas Jackson qui partait en contre.` },
  { minute: 42, type: "text", descFn: () => `Le jeu se hache un peu avant la mi-temps. Les deux équipes commettent des petites fautes tactiques pour casser les rythmes.` }
];

// ── BANQUE D'ACTIONS 2È ME MI-TEMPS (COMMUNE MAIS ADAPTÉE) ───────────────────────
const GENERAL_2ND = [
  { minute: 47, type: "text", descFn: () => `Le match reprend ! Les Lions reviennent sur la pelouse avec un visage conquérant et une agressivité renforcée dans les duels.` },
  { minute: 52, type: "goal", descFn: () => `⚽ BUT POUR LE SÉNÉGAL !!! L'ÉGALISATION ! Incroyable mouvement collectif orchestré par Lamine Camara. Il décale idéalement Ismaïla Sarr dont le centre au cordeau trouve Nicolas Jackson. Le plat du pied est parfait, le stade explose ! (1-1)` },
  { minute: 58, type: "text", descFn: () => `La Norvège accuse le coup physiquement. Les lignes scandinaves commencent à s'étirer, offrant plus d'espaces à Sadio Mané.` },
  { minute: 64, type: "save", descFn: () => `Alerte dans la surface des Lions ! Sur un coup franc excentré d'Ødegaard, Haaland place une tête puissante. Arrêt réflexe exceptionnel d'Édouard Mendy !` },
  { minute: 70, type: "text", descFn: () => `Changement tactique visible sur le terrain : le Sénégal accentue son utilisation des couloirs pour étirer le bloc norvégien.` },
  { minute: 75, type: "shot", descFn: () => `La frappe de Sadio Mané ! Repiquant depuis son aile gauche, le numéro 10 sénégalais enroule son ballon, mais Nyland se détend magnifiquement pour détourner en corner.` },
  { minute: 80, type: "sub", descFn: () => `🔄 DOUBLE CHANGEMENT TACTIQUE : Fatigués par l'intensité, Nicolas Jackson et Ismaïla Sarr cèdent leurs places. Le coach fait entrer du sang neuf pour faire basculer le match !` },
  { minute: 84, type: "text", descFn: (l, f) => `Le chrono tourne. La fatigue est là, mais votre système en ${f} maintient une cohésion parfaite face aux assauts désespérés d'Haaland.` },
  { minute: 88, type: "goal", descFn: () => `🔥 BUT HISTORIQUE POUR LE SÉNÉGAL À LA 88e MINUTE !!! INCROYABLE SCÉNARIO ! Le joueur entré en jeu initie l'action, combine avec Lamine Camara qui sert Sadio Mané. Le capitaine ne tremble pas et ajuste Nyland d'un tir chirurgical en pleine lucarne ! Le Sénégal prend l'avantage ! (2-1)` },
  { minute: 92, type: "text", descFn: () => `Temps additionnel. La Norvège jette toutes ses forces dans la bataille, même le gardien Nyland monte sur le dernier corner !` },
  { minute: 94, type: "text", descFn: () => `Interception héroïque de Kalidou Koulibaly de la tête ! Le ballon est dégagé loin devant !` }
];

// ── FONCTION DE DISTRIBUTION DES ÉVÉNEMENTS ───────────────────────
export function getScriptedEventsForHalf(half, tacticId, senegalPlayers, formation) {
  let pool = [];

  if (half === 1) {
    if (["4-3-3", "4-2-3-1"].includes(formation)) pool = OFFENSIVE_1ST;
    else if (["5-3-2", "5-4-1"].includes(formation)) pool = DEFENSIVE_1ST;
    else pool = BALANCED_1ST;
  } else {
    pool = GENERAL_2ND;
  }

  // Transformation dynamique des descriptions textuelles
  return pool.map(event => ({
    ...event,
    scripted: true,
    desc: event.descFn(senegalPlayers, formation),
    rawStats: {
      senegal: {
        tirs: event.type === "shot" || event.type === "goal" ? 1 : 0,
        cadres: event.type === "goal" ? 1 : (event.type === "shot" && Math.random() > 0.5 ? 1 : 0),
        xg: event.type === "goal" ? 0.65 : (event.type === "shot" ? 0.25 : 0)
      },
      norvege: {
        tirs: event.type === "save" || (event.type === "goal" && event.desc.includes("NORVÈGE")) ? 1 : 0,
        cadres: event.type === "save" || (event.type === "goal" && event.desc.includes("NORVÈGE")) ? 1 : 0,
        xg: event.type === "goal" && event.desc.includes("NORVÈGE") ? 0.55 : 0
      }
    }
  }));
}

// Fonction pour résoudre si un événement scénarisé se déclenche
// selon la tactique choisie par l'utilisateur
export function resolveScriptedEvent(event, tacticId) {
  const prob = event.tacticsModifier?.[tacticId] ?? event.prob;
  return Math.random() < prob;
}


