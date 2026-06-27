// src/data/matchGenerator.js
// Générateur automatique de simulation pour n'importe quel match.
// Fonctionne sans données manuelles — basé sur les notes FIFA des équipes.
// Les matchs Sénégal utilisent toujours leurs vraies données (sen_nor_2026.js, etc.)
// Les autres matchs utilisent ce générateur automatiquement.

// ── Noms génériques réalistes par région ─────────────────────────────────
const PLAYER_NAMES = {
  europe:  ["Müller", "Silva", "Dupont", "Rossi", "García", "Kovač", "Nielsen", "Björk", "Walsh", "Kowalski"],
  afrique: ["Diallo", "Traoré", "Koné", "Mbeki", "Okafor", "Mensah", "Diop", "Touré", "Kamara", "Ndoye"],
  amerique:["Rodríguez", "Santos", "Herrera", "Lima", "Vargas", "Morales", "Fernández", "Cruz", "Rojas", "Pereira"],
  asie:    ["Kim", "Park", "Tanaka", "Yamamoto", "Al-Dawsari", "Saleh", "Zhao", "Nguyen", "Khalid", "Hassan"],
  default: ["Striker", "Midfield", "Defender", "Keeper", "Forward", "Winger", "Playmaker", "Target", "Anchor", "Libero"],
};

function getRegion(flag) {
  const africaFlags   = ["🇸🇳","🇨🇮","🇬🇭","🇳🇬","🇲🇦","🇪🇬","🇨🇲","🇲🇱","🇬🇳","🇿🇦","🇹🇳","🇩🇿","🇦🇴","🇸🇱","🇺🇬"];
  const europeFlags   = ["🇫🇷","🇩🇪","🇪🇸","🇮🇹","🇵🇹","🇧🇪","🇳🇱","🇭🇷","🇩🇰","🇸🇪","🇳🇴","🇨🇭","🇦🇹","🇵🇱","🇨🇿","🏴󠁧󠁢󠁥󠁮󠁧󠁿"];
  const americaFlags  = ["🇧🇷","🇦🇷","🇨🇴","🇺🇾","🇲🇽","🇺🇸","🇨🇦","🇨🇱","🇵🇪","🇪🇨","🇵🇦","🇯🇲"];
  const asiaFlags     = ["🇯🇵","🇰🇷","🇮🇷","🇸🇦","🇦🇺","🇨🇳","🇶🇦","🇮🇶","🇦🇪","🇻🇳","🇹🇭","🇺🇿"];
  if (africaFlags.includes(flag))  return "afrique";
  if (europeFlags.includes(flag))  return "europe";
  if (americaFlags.includes(flag)) return "amerique";
  if (asiaFlags.includes(flag))    return "asie";
  return "default";
}

function randomName(region) {
  const pool = PLAYER_NAMES[region] ?? PLAYER_NAMES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Génération des joueurs d une équipe ───────────────────────────────────
function generatePlayers(teamName, flag, rating) {
  const region = getRegion(flag);
  const baseStats = (pos) => {
    const r = rating;
    if (pos === "GK")  return { PAC: Math.round(r*0.62), TIR: 15, PAS: Math.round(r*0.68), DRI: Math.round(r*0.45), DEF: Math.round(r*1.08), PHY: Math.round(r*1.02) };
    if (pos === "DEF") return { PAC: Math.round(r*0.90), TIR: Math.round(r*0.48), PAS: Math.round(r*0.82), DRI: Math.round(r*0.76), DEF: Math.round(r*1.10), PHY: Math.round(r*1.08) };
    if (pos === "MIL") return { PAC: Math.round(r*0.90), TIR: Math.round(r*0.80), PAS: Math.round(r*1.05), DRI: Math.round(r*0.95), DEF: Math.round(r*0.78), PHY: Math.round(r*0.90) };
    return               { PAC: Math.round(r*1.05), TIR: Math.round(r*1.04), PAS: Math.round(r*0.82), DRI: Math.round(r*1.02), DEF: Math.round(r*0.40), PHY: Math.round(r*0.90) };
  };

  const lineup = [
    { pos: "GK",  num: 1  },
    { pos: "DEF", num: 2  }, { pos: "DEF", num: 3  }, { pos: "DEF", num: 4  }, { pos: "DEF", num: 5  },
    { pos: "MIL", num: 6  }, { pos: "MIL", num: 8  }, { pos: "MIL", num: 10 },
    { pos: "ATT", num: 7  }, { pos: "ATT", num: 9  }, { pos: "ATT", num: 11 },
  ];

  return lineup.map(({ pos, num }) => ({
    id:       `${teamName.toLowerCase().replace(/\s/g,"_")}_${num}`,
    name:     randomName(region),
    number:   num,
    position: pos,
    rating,
    ratingBase: rating,
    stats:    baseStats(pos),
  }));
}

// ── Générateur d événements narratifs automatiques ────────────────────────
// Basé sur le différentiel de notes entre les deux équipes
// context: "must_win" | "normal" | "dead_rubber"

function generateEvents(half, homeTeam, awayTeam, context = "normal") {
  const diff = homeTeam.rating - awayTeam.rating; // positif = home favoris
  const homeWins = diff > 3;
  const awayWins = diff < -3;
  const balanced = Math.abs(diff) <= 3;

  const homeFlag = homeTeam.flag;
  const awayFlag = awayTeam.flag;
  const homeName = homeTeam.name;
  const awayName = awayTeam.name;

  // Noms génériques des stars
  const homeStar   = homeTeam.players?.find(p => p.position === "ATT")?.name ?? "l'attaquant";
  const awayStar   = awayTeam.players?.find(p => p.position === "ATT")?.name ?? "l'attaquant";
  const homeMid    = homeTeam.players?.find(p => p.position === "MIL")?.name ?? "le milieu";
  const homeGK     = homeTeam.players?.find(p => p.position === "GK")?.name  ?? "le gardien";

  const events1stHome = [
    { minute:  5, type: "text",   team: "me",  player: "",         desc: `${homeName} entre dans le match avec ambition. Bloc haut, pressing immédiat.` },
    { minute: 12, type: "shot",   team: "me",  player: homeStar,   desc: `${homeStar} obtient la première occasion — frappe repoussée par le gardien adverse.` },
    { minute: 20, type: "corner", team: "me",  player: homeMid,    desc: `Corner obtenu après un centre dévié. ${homeName} pousse !` },
    { minute: homeWins ? 28 : 35, type: "goal", team: "me", player: homeStar,
      desc: `⚽ BUT DE ${homeName.toUpperCase()} ! ${homeStar} conclut une belle action collective. ${homeFlag} prend l'avantage !` },
    { minute: 40, type: "yellow", team: "ai",  player: awayStar,   desc: `Carton jaune pour ${awayName} — faute grossière sur ${homeMid}.` },
    { minute: 44, type: "miss",   team: "me",  player: homeStar,   desc: `${homeStar} manque le break avant la pause — sa frappe frôle le montant.` },
  ];

  const events1stAway = [
    { minute:  6, type: "text",   team: "me",  player: "",         desc: `Match fermé dès le début. ${awayName} défend bien et attend son heure.` },
    { minute: 15, type: "save",   team: "me",  player: homeGK,     desc: `${homeGK} sort une parade décisive sur une frappe de loin de ${awayName}.` },
    { minute: 22, type: "shot",   team: "me",  player: homeStar,   desc: `${homeStar} tente sa chance — la frappe passe juste au-dessus.` },
    { minute: 31, type: "goal",   team: "ai",  player: awayStar,   desc: `⚽ SURPRISE ! ${awayName} ouvre le score contre le cours du jeu ! ${awayStar} conclut en contre. ${awayFlag} mène !` },
    { minute: 38, type: "text",   team: "me",  player: "",         desc: `${homeName} doit réagir ! Le jeu s'ouvre, les espaces apparaissent.` },
    { minute: 43, type: "miss",   team: "me",  player: homeStar,   desc: `Occasion manquée avant la pause — ${homeStar} ne cadre pas sa tête.` },
  ];

  const events1stBalanced = [
    { minute:  7, type: "text",   team: "me",  player: "",         desc: `Match très équilibré. Les deux équipes se neutralisent au milieu de terrain.` },
    { minute: 14, type: "shot",   team: "me",  player: homeStar,   desc: `${homeStar} tente une frappe de loin — captée par le gardien adverse.` },
    { minute: 23, type: "shot",   team: "ai",  player: awayStar,   desc: `${awayName} répond ! ${awayStar} force une parade de ${homeGK}.` },
    { minute: 33, type: "goal",   team: "me",  player: homeStar,   desc: `⚽ BUT ! ${homeStar} profite d'une erreur défensive adverse pour ouvrir le score. ${homeFlag} mène !` },
    { minute: 39, type: "corner", team: "ai",  player: awayStar,   desc: `${awayName} obtient un corner dangereux — la défense repousse de justesse.` },
    { minute: 44, type: "text",   team: "me",  player: "",         desc: `${homeName} tient bon avant la pause. Match ouvert pour la 2e mi-temps.` },
  ];

  const events2nd = [
    { minute: 47, type: "text",   team: "me",  player: "",         desc: `La 2e mi-temps reprend. ${homeName} veut confirmer son avantage.` },
    { minute: balanced ? 55 : 52, type: "goal", team: "me", player: homeStar,
      desc: `⚽ DEUXIÈME BUT ! ${homeStar} double la mise ! ${homeFlag} prend le large !` },
    { minute: 63, type: "save",   team: "me",  player: homeGK,     desc: `Parade décisive de ${homeGK} sur une frappe puissante de ${awayStar} !` },
    { minute: 70, type: "text",   team: "me",  player: "",         desc: `${homeName} contrôle le match. Les changements tactiques stabilisent le jeu.` },
    { minute: 75, type: "sub",    team: "me",  player: homeMid,    desc: `🔄 Changement tactique pour ${homeName} — gestion du score en fin de match.` },
    { minute: awayWins ? 79 : 82, type: "goal", team: balanced ? "ai" : "me",
      player: balanced ? awayStar : homeStar,
      desc: balanced
        ? `⚽ ÉGALISATION ! ${awayStar} trompe ${homeGK} d'une frappe croisée ! Match nul !`
        : `⚽ TROISIÈME BUT ! ${homeStar} enfonce le clou. Le match est plié !` },
    { minute: 88, type: "text",   team: "me",  player: "",         desc: `Les dernières minutes s'écoulent. ${homeName} gère sereinement.` },
    { minute: 93, type: "text",   team: "me",  player: "",         desc: `Coup de sifflet final ! ${homeName} s'impose !` },
  ];

  let pool;
  if (half === 1) {
    if (homeWins || context === "must_win") pool = events1stHome;
    else if (awayWins)                      pool = events1stAway;
    else                                    pool = events1stBalanced;
  } else {
    pool = events2nd;
  }

  return pool.map(e => ({ ...e, scripted: true }));
}

// ── Génère un match complet pour n importe quelle paire d équipes ─────────
export function generateMatch(homeTeam, awayTeam, context = "normal") {
  const homePlayers = homeTeam.players ?? generatePlayers(homeTeam.name, homeTeam.flag, homeTeam.rating);
  const awayPlayers = awayTeam.players ?? generatePlayers(awayTeam.name, awayTeam.flag, awayTeam.rating);

  return {
    SENEGAL_MATCH: {
      formation: "4-3-3",
      players:   homePlayers,
      bench:     [],
    },
    AWAY_MATCH: {
      formation: "4-3-3",
      players:   awayPlayers,
      bench:     [],
    },
    NORWAY_MATCH: { // alias pour compatibilité
      formation: "4-3-3",
      players:   awayPlayers,
      bench:     [],
    },
    MATCH_CONTEXT: {
      title:       `${homeTeam.flag} ${homeTeam.name} vs ${awayTeam.flag} ${awayTeam.name}`,
      description: `${homeTeam.name} (note FIFA ${homeTeam.rating}) affronte ${awayTeam.name} (note FIFA ${awayTeam.rating}). ${
        homeTeam.rating > awayTeam.rating
          ? `${homeTeam.name} est favori avec ${homeTeam.rating - awayTeam.rating} points d'écart.`
          : homeTeam.rating < awayTeam.rating
          ? `${awayTeam.name} est favori — attention !`
          : "Match très équilibré — tout est possible !"
      }`,
      urgency:     context === "must_win" ? "critical" : "normal",
      awayContext: `${awayTeam.name} (note ${awayTeam.rating}) · Formation 4-3-3`,
    },
    getScriptedEventsForHalf: (half, tacticId, players, formation) =>
      generateEvents(half, { ...homeTeam, players: homePlayers }, { ...awayTeam, players: awayPlayers }, context),
    resolveScriptedEvent: () => true,
  };
}

// ── Convertit une entrée du matchRegistry en module simulable ─────────────
export function registryToModule(matchEntry) {
  return generateMatch(
    { name: matchEntry.homeTeam.name, flag: matchEntry.homeTeam.flag, rating: matchEntry.homeTeam.fifaRating ?? 75 },
    { name: matchEntry.awayTeam.name, flag: matchEntry.awayTeam.flag, rating: matchEntry.awayTeam.fifaRating ?? 70 },
    matchEntry.context ?? "normal"
  );
}
