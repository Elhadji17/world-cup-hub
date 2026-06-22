// src/data/starter-team.js
// Équipe de départ offerte automatiquement aux nouveaux joueurs.
// 11 joueurs bronze couvrant toutes les positions, incluant un gardien.
// Ces joueurs sont aussi ajoutés à la collection du joueur.

export const STARTER_PLAYERS = [
  // Gardien
  { id: "start_gk",  name: "Alex Gardien",  country: "International", flag: "🌍", position: "GK",  rating: 68, rarity: "bronze", stats: { PAC: 48, TIR: 12, PAS: 42, DRI: 30, DEF: 72, PHY: 74 } },
  // Défenseurs
  { id: "start_rb",  name: "Marco Latéral", country: "International", flag: "🌍", position: "DEF", rating: 65, rarity: "bronze", stats: { PAC: 72, TIR: 38, PAS: 62, DRI: 60, DEF: 68, PHY: 68 } },
  { id: "start_cb1", name: "Pierre Central", country: "International", flag: "🌍", position: "DEF", rating: 66, rarity: "bronze", stats: { PAC: 62, TIR: 30, PAS: 58, DRI: 50, DEF: 74, PHY: 76 } },
  { id: "start_cb2", name: "Luis Stoppeur",  country: "International", flag: "🌍", position: "DEF", rating: 65, rarity: "bronze", stats: { PAC: 60, TIR: 28, PAS: 55, DRI: 48, DEF: 75, PHY: 78 } },
  { id: "start_lb",  name: "Carlos Côté",   country: "International", flag: "🌍", position: "DEF", rating: 64, rarity: "bronze", stats: { PAC: 74, TIR: 40, PAS: 60, DRI: 62, DEF: 65, PHY: 66 } },
  // Milieux
  { id: "start_cm1", name: "Yann Récup",    country: "International", flag: "🌍", position: "MIL", rating: 66, rarity: "bronze", stats: { PAC: 65, TIR: 52, PAS: 70, DRI: 62, DEF: 65, PHY: 72 } },
  { id: "start_cm2", name: "David Créa",    country: "International", flag: "🌍", position: "MIL", rating: 67, rarity: "bronze", stats: { PAC: 68, TIR: 60, PAS: 74, DRI: 68, DEF: 52, PHY: 65 } },
  { id: "start_cm3", name: "Omar Relayeur", country: "International", flag: "🌍", position: "MIL", rating: 65, rarity: "bronze", stats: { PAC: 70, TIR: 58, PAS: 68, DRI: 65, DEF: 55, PHY: 68 } },
  // Attaquants
  { id: "start_rw",  name: "Kofi Ailier",   country: "International", flag: "🌍", position: "ATT", rating: 67, rarity: "bronze", stats: { PAC: 80, TIR: 68, PAS: 62, DRI: 74, DEF: 32, PHY: 65 } },
  { id: "start_lw",  name: "Bruno Vite",    country: "International", flag: "🌍", position: "ATT", rating: 66, rarity: "bronze", stats: { PAC: 78, TIR: 65, PAS: 60, DRI: 72, DEF: 30, PHY: 63 } },
  { id: "start_st",  name: "Ibra Buteur",   country: "International", flag: "🌍", position: "ATT", rating: 68, rarity: "bronze", stats: { PAC: 70, TIR: 74, PAS: 55, DRI: 68, DEF: 28, PHY: 78 } },
];

// Formation 4-3-3 par défaut avec les 11 joueurs de départ
export const STARTER_TEAM = {
  GK:  STARTER_PLAYERS[0],
  RB:  STARTER_PLAYERS[1],
  CB1: STARTER_PLAYERS[2],
  CB2: STARTER_PLAYERS[3],
  LB:  STARTER_PLAYERS[4],
  CM1: STARTER_PLAYERS[5],
  CM2: STARTER_PLAYERS[6],
  CM3: STARTER_PLAYERS[7],
  RW:  STARTER_PLAYERS[8],
  LW:  STARTER_PLAYERS[9],
  ST:  STARTER_PLAYERS[10],
};
