// src/data/matches/sen_bel_2026.js
// Sénégal vs Belgique — 16es de finale · 1er juillet 2026 · Seattle

function toEnginePlayer(p) {
  const base = p.ratingBase;
  let stats;
  if (p.position === "GK") {
    stats = { PAC: Math.round(base*0.62), TIR: 15, PAS: Math.round(base*0.68), DRI: Math.round(base*0.45), DEF: Math.round(base*1.08), PHY: Math.round(base*1.02) };
  } else if (p.position === "DEF") {
    stats = { PAC: Math.round(base*0.90), TIR: Math.round(base*0.48), PAS: Math.round(base*0.82), DRI: Math.round(base*0.76), DEF: Math.round(base*1.10), PHY: Math.round(base*1.08) };
  } else if (p.position === "MIL") {
    stats = { PAC: Math.round(base*0.90), TIR: Math.round(base*0.80), PAS: Math.round(base*1.05), DRI: Math.round(base*0.95), DEF: Math.round(base*0.78), PHY: Math.round(base*0.90) };
  } else {
    stats = { PAC: Math.round(base*1.05), TIR: Math.round(base*1.04), PAS: Math.round(base*0.82), DRI: Math.round(base*1.02), DEF: Math.round(base*0.40), PHY: Math.round(base*0.90) };
  }
  return { ...p, rating: base, stats };
}

// ── Sénégal — probable 4-3-3 ────────────────────────────────────────────
const SENEGAL_RAW = {
  formation: "4-3-3",
  players: [
    // Mendy blessé → Diaw probable titulaire
    { id:"diaw_23",    name:"M. Diaw",     number:23, position:"GK",  ratingBase:74, recentForm:[7.5] },
    { id:"diatta_15",  name:"K. Diatta",   number:15, position:"DEF", ratingBase:78, recentForm:[7.0,7.2,7.8] },
    { id:"koulibaly_3",name:"Koulibaly",   number:3,  position:"DEF", ratingBase:83, recentForm:[6.2,6.5,8.0] },
    { id:"niakhate_19",name:"M. Niakhaté", number:19, position:"DEF", ratingBase:79, recentForm:[6.0,7.0,7.8] },
    { id:"diouf_25",   name:"M. Diouf",    number:25, position:"DEF", ratingBase:77, recentForm:[6.5,6.8,7.5] },
    { id:"camara_8",   name:"L. Camara",   number:8,  position:"MIL", ratingBase:82, recentForm:[7.1,7.5,7.8] },
    { id:"gueye_5",    name:"I. Gueye",    number:5,  position:"MIL", ratingBase:76, recentForm:[6.3,6.5,7.0] },
    { id:"diarra_21",  name:"H. Diarra",   number:21, position:"MIL", ratingBase:77, recentForm:[8.0] },
    { id:"sarr_18",    name:"I. Sarr",     number:18, position:"ATT", ratingBase:85, recentForm:[6.5,9.0,8.2] },
    { id:"jackson_11", name:"N. Jackson",  number:11, position:"ATT", ratingBase:81, recentForm:[6.4,6.5,7.2] },
    { id:"mane_10",    name:"S. Mané",     number:10, position:"ATT", ratingBase:85, recentForm:[6.8,6.8,7.5] },
  ],
  bench: [
    { id:"ndiaye_13",  name:"I. Ndiaye",   number:13, position:"ATT", ratingBase:79, recentForm:[7.2,8.8] },
    { id:"gueye_26",   name:"P. Gueye",    number:26, position:"MIL", ratingBase:79, recentForm:[6.6,6.4,9.2] },
    { id:"mendy_16",   name:"É. Mendy",    number:16, position:"GK",  ratingBase:82, recentForm:[6.5,6.8] },
    { id:"jakobs_14",  name:"I. Jakobs",   number:14, position:"DEF", ratingBase:76, recentForm:[7.6] },
    { id:"sarr_17",    name:"P.M. Sarr",   number:17, position:"MIL", ratingBase:78, recentForm:[7.0,7.1] },
  ],
};

// ── Belgique — 4-3-3 / 4-2-3-1 ─────────────────────────────────────────
const BELGIUM_RAW = {
  formation: "4-3-3",
  players: [
    { id:"bel_gk",   name:"K. Casteels",  number:1,  position:"GK",  ratingBase:84 },
    { id:"bel_rb",   name:"T. Castagne",  number:2,  position:"DEF", ratingBase:80 },
    { id:"bel_cb1",  name:"W. Faes",      number:4,  position:"DEF", ratingBase:82 },
    { id:"bel_cb2",  name:"J. Vertonghen",number:5,  position:"DEF", ratingBase:80 },
    { id:"bel_lb",   name:"T. Hazard",    number:3,  position:"DEF", ratingBase:78 },
    { id:"bel_cm1",  name:"A. Onana",     number:8,  position:"MIL", ratingBase:82 },
    { id:"bel_cm2",  name:"Y. Tielemans", number:6,  position:"MIL", ratingBase:83 },
    { id:"bel_cm3",  name:"K. De Bruyne", number:7,  position:"MIL", ratingBase:91 }, // STAR ★
    { id:"bel_rw",   name:"J. Doku",      number:11, position:"ATT", ratingBase:84 },
    { id:"bel_st",   name:"R. Lukaku",    number:9,  position:"ATT", ratingBase:86 }, // STAR ★
    { id:"bel_lw",   name:"L. Trossard",  number:14, position:"ATT", ratingBase:82 },
  ],
  bench: [],
};

export const SENEGAL_MATCH = {
  ...SENEGAL_RAW,
  players: SENEGAL_RAW.players.map(toEnginePlayer),
  bench:   SENEGAL_RAW.bench.map(toEnginePlayer),
};

export const AWAY_MATCH = {
  ...BELGIUM_RAW,
  players: BELGIUM_RAW.players.map(toEnginePlayer),
};

export const NORWAY_MATCH = AWAY_MATCH; // alias compatibilité

export const MATCH_CONTEXT = {
  title:       "16es de finale — Match de survie !",
  description: "Le Sénégal qualifié en tant que meilleur 3e du groupe I affronte la Belgique, 1re de son groupe. Diaw remplace Mendy blessé. De Bruyne et Lukaku sont les menaces principales. C'est le match le plus important depuis le titre CAN 2021.",
  urgency:     "critical",
  awayContext: "Belgique (4-3-3) : De Bruyne ★ en meneur, Lukaku ★ en avant-centre, Doku explosif sur le côté droit. Attention aux transitions rapides.",
};

// ── Timeline d'événements pour le terrain tactique (style Régie TV) ──────
export const MATCH_TIMELINE_EVENTS = [
  { minute:5,  type:"text",   team:"me",  player:"",          desc:"Le Sénégal pose le jeu. Relance basse orchestrée par Koulibaly. Bloc médian compact face à la Belgique." },
  { minute:12, type:"text",   team:"ai",  player:"De Bruyne", desc:"⚠️ De Bruyne décroche entre les lignes — I.Gueye doit fermer l'espace immédiatement." },
  { minute:18, type:"shot",   team:"me",  player:"I. Sarr",   desc:"🎯 Sarr part en vitesse pure dans le couloir droit, centre fort — déviation en corner !" },
  { minute:25, type:"text",   team:"me",  player:"L. Camara", desc:"⚡ Pressing haut déclenché par Camara. Les Lions remontent sur les défenseurs belges." },
  { minute:31, type:"miss",   team:"me",  player:"N. Jackson", desc:"Grosse occasion manquée ! Jackson reçoit en profondeur, frappe croisée — à côté !" },
  { minute:38, type:"save",   team:"me",  player:"M. Diaw",   desc:"🧤 PARADE DÉCISIVE DE DIAW ! Lukaku de la tête sur corner — Diaw claque en deux temps !" },
  { minute:44, type:"goal",   team:"me",  player:"S. Mané",   desc:"⚽ BUT DU SÉNÉGAL ! Mané repique depuis la gauche, élimine Faes d'un double contact magique et enroule en lucarne ! (1-0)" },
  { minute:56, type:"text",   team:"ai",  player:"Lukaku",    desc:"La Belgique pousse fort. Lukaku physique face à Koulibaly — duel aérien crucial à la 56e." },
  { minute:63, type:"corner", team:"me",  player:"I. Sarr",   desc:"🚩 Corner obtenu par Sarr. Koulibaly monte ! Sa tête puissante frôle le poteau !" },
  { minute:71, type:"goal",   team:"ai",  player:"De Bruyne", desc:"⚽ ÉGALISATION BELGIQUE. De Bruyne frappe de loin dans l'angle — Diaw ne peut rien. (1-1)" },
  { minute:78, type:"sub",    team:"me",  player:"I. Ndiaye",  playerId:"ndiaye_13", outId:"jackson_11", desc:"🔄 ENTRÉE D'ILIMAN NDIAYE ! Le super-sub entre pour changer le match entre les lignes." },
  { minute:86, type:"text",   team:"me",  player:"",          desc:"⚡ PRESSING TOTAL des Lions ! Tout le monde monte — il reste 4 minutes pour arracher la qualification !" },
  { minute:90, type:"goal",   team:"me",  player:"I. Ndiaye", desc:"🔥 BUT DE NDIAYE À LA 90E !!! INCROYABLE ! Ndiaye reçoit de Camara, dribble Casteels et pousse au fond ! (2-1) QUALIFICATION !!!" },
];

// ── Événements scénarisés par mi-temps ───────────────────────────────────
const EVENTS_1ST_OFFENSIVE = [
  { minute:5,  type:"text",   team:"me",  player:"",          desc:"Le Sénégal démarre avec ambition face aux Diables Rouges. Bloc haut, Mané cherche immédiatement De Bruyne pour couper ses lignes de passe." },
  { minute:12, type:"text",   team:"ai",  player:"De Bruyne", desc:"⚠️ Danger ! De Bruyne décroche entre les lignes — I.Gueye ferme l'espace, intervention capitale." },
  { minute:18, type:"shot",   team:"me",  player:"I. Sarr",   desc:"Sarr explose dans le couloir droit, élimine Hazard d'un crochet, centre fort — déviation en corner !" },
  { minute:25, type:"text",   team:"me",  player:"",          desc:"Pressing haut déclenché ! Camara récupère un ballon mal relancé de Faes. Le Sénégal est dangereux." },
  { minute:31, type:"miss",   team:"me",  player:"N. Jackson", desc:"Grosse occasion ! Jackson reçoit de Mané en profondeur, frappe croisée — Casteels en détend !" },
  { minute:38, type:"save",   team:"me",  player:"M. Diaw",   desc:"🧤 PARADE DE DIAW ! Lukaku de la tête sur corner — Diaw claque en deux temps. Quel arrêt !" },
  { minute:44, type:"goal",   team:"me",  player:"S. Mané",   desc:"⚽ BUT DU SÉNÉGAL ! Mané repique depuis la gauche, élimine Faes d'un double contact et enroule en lucarne. Chef-d'œuvre ! (1-0)" },
];

const EVENTS_1ST_DEFENSIVE = [
  { minute:6,  type:"text",   team:"me",  player:"",          desc:"Bloc bas sénégalais — rideau de fer face à De Bruyne et Lukaku. L'organisation défensive est parfaite." },
  { minute:14, type:"save",   team:"me",  player:"M. Diaw",   desc:"🧤 Première parade de Diaw ! Tir de Doku depuis l'aile — captée proprement." },
  { minute:22, type:"shot",   team:"me",  player:"I. Sarr",   desc:"Contre-attaque éclair ! Sarr récupère et remonte 50 mètres — frappe repoussée par Casteels !" },
  { minute:30, type:"text",   team:"ai",  player:"Lukaku",    desc:"Lukaku physique, monte avec force face à Koulibaly. Le capitaine tient bon — duel gagné !" },
  { minute:38, type:"miss",   team:"me",  player:"N. Jackson", desc:"Jackson en profondeur sur un long ballon de Koulibaly — hors-jeu de peu. Frustrant !" },
  { minute:44, type:"text",   team:"me",  player:"",          desc:"Le Sénégal résiste admirablement. 0-0 mérité. La Belgique n'a pas passé le bloc sénégalais." },
];

const EVENTS_1ST_BALANCED = [
  { minute:5,  type:"text",   team:"me",  player:"",          desc:"Match équilibré dès le début. Sénégal et Belgique se neutralisent dans un milieu de terrain intense." },
  { minute:14, type:"text",   team:"ai",  player:"De Bruyne", desc:"De Bruyne teste Diaw depuis 25 mètres — le gardien sort proprement." },
  { minute:22, type:"shot",   team:"me",  player:"L. Camara", desc:"Camara surgit de nulle part, frappe de loin — déviation en corner !" },
  { minute:31, type:"text",   team:"ai",  player:"Doku",      desc:"Doku accélère sur l'aile gauche — Diatta intervient d'un tacle décisif." },
  { minute:38, type:"goal",   team:"me",  player:"S. Mané",   desc:"⚽ BUT DU SÉNÉGAL sur une belle combinaison ! Camara sert Mané qui frappe du pied droit. (1-0)" },
  { minute:43, type:"yellow", team:"ai",  player:"Faes",      desc:"Carton jaune pour Faes, coupable d'une faute grossière sur Jackson en contre-attaque." },
];

const EVENTS_2ND = [
  { minute:47, type:"text",   team:"me",  player:"",          desc:"La 2e mi-temps reprend ! Les Lions reviennent avec une intensité maximale — on veut la qualification !" },
  { minute:56, type:"text",   team:"ai",  player:"Lukaku",    desc:"La Belgique pousse fort. Lukaku physique face à Koulibaly — duel aérien crucial. Koulibaly gagne !" },
  { minute:63, type:"corner", team:"me",  player:"I. Sarr",   desc:"🚩 Corner obtenu par Sarr. Koulibaly monte ! Sa tête puissante frôle le poteau — si près !" },
  { minute:71, type:"goal",   team:"ai",  player:"De Bruyne", desc:"⚽ ÉGALISATION BELGIQUE ! De Bruyne frappe dans l'angle depuis 22 mètres — Diaw ne peut rien. (1-1)" },
  { minute:78, type:"sub",    team:"me",  player:"I. Ndiaye",  playerId:"ndiaye_13", outId:"jackson_11", desc:"🔄 ENTRÉE D'ILIMAN NDIAYE ! Le super-sub entre pour changer le match entre les lignes." },
  { minute:83, type:"shot",   team:"me",  player:"I. Ndiaye", desc:"Ndiaye tente immédiatement ! Frappe enroulée — Casteels détourne de justesse en corner !" },
  { minute:86, type:"text",   team:"me",  player:"",          desc:"⚡ PRESSING TOTAL des Lions ! Tout le monde monte — il faut arracher la qualification !" },
  { minute:90, type:"goal",   team:"me",  player:"I. Ndiaye", desc:"🔥 BUT DE NDIAYE À LA 90e !!! QUALIFICATION !!! Ndiaye reçoit de Camara, élimine Casteels et pousse au fond ! INCROYABLE ! (2-1)" },
  { minute:93, type:"text",   team:"me",  player:"",          desc:"Coup de sifflet final ! Le SÉNÉGAL EST EN QUARTS DE FINALE ! Les Lions rugissent à Seattle ! 🦁🇸🇳" },
];

export function getScriptedEventsForHalf(half, tacticId, senegalPlayers = [], formation = "4-3-3") {
  const f = formation || "4-3-3";
  let pool;
  if (half === 1) {
    if (["4-3-3","4-2-3-1"].includes(f))   pool = EVENTS_1ST_OFFENSIVE;
    else if (["5-3-2"].includes(f))          pool = EVENTS_1ST_DEFENSIVE;
    else                                      pool = EVENTS_1ST_BALANCED;
  } else {
    pool = EVENTS_2ND;
  }
  return pool.map(e => ({ ...e, scripted: true }));
}

export function resolveScriptedEvent(event) {
  return Math.random() < (event.prob ?? 1);
}
