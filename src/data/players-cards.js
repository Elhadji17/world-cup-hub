// src/data/players-cards.js
// Joueurs pour le système de cartes — Stars mondiales + WC 2026

export const RARITIES = {
  BRONZE:    { id: "bronze",    label: "Bronze",    color: "#cd7f32", bg: "from-amber-800 to-amber-600",   glow: "shadow-amber-600/50",  probability: 0 },
  SILVER:    { id: "silver",    label: "Argent",    color: "#c0c0c0", bg: "from-gray-400 to-gray-300",     glow: "shadow-gray-400/50",   probability: 0 },
  GOLD:      { id: "gold",      label: "Or",        color: "#ffd700", bg: "from-yellow-500 to-amber-400",  glow: "shadow-yellow-400/50", probability: 0 },
  LEGENDARY: { id: "legendary", label: "Légendaire",color: "#a855f7", bg: "from-purple-600 to-pink-500",  glow: "shadow-purple-500/50", probability: 0 },
};

export const PLAYERS = [
  // ── LÉGENDAIRES ──────────────────────────────────────────────────────────
  {
    id: "messi",
    name: "Lionel Messi",
    country: "Argentine", flag: "🇦🇷",
    position: "ATT", rating: 99,
    rarity: "legendary",
    image: "/Players/Messi.jpg",
    stats: { PAC: 85, TIR: 98, PAS: 97, DRI: 99, DEF: 40, PHY: 70 },
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    country: "Portugal", flag: "🇵🇹",
    position: "ATT", rating: 98,
    rarity: "legendary",
    image: "/Players/Cristiano.jpg",
    stats: { PAC: 87, TIR: 98, PAS: 83, DRI: 95, DEF: 35, PHY: 95 },
  },

  // ── OR ────────────────────────────────────────────────────────────────────
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    country: "France", flag: "🇫🇷",
    position: "ATT", rating: 95,
    rarity: "gold",
    image: "/Players/Mbappe.jpg",
    stats: { PAC: 99, TIR: 93, PAS: 85, DRI: 96, DEF: 42, PHY: 80 },
  },
  {
    id: "vinicius",
    name: "Vinicius Jr",
    country: "Brésil", flag: "🇧🇷",
    position: "ATT", rating: 94,
    rarity: "gold",
    image: "/Players/Vinicius.jpg",
    stats: { PAC: 97, TIR: 88, PAS: 82, DRI: 97, DEF: 30, PHY: 75 },
  },
  {
    id: "haaland",
    name: "Erling Haaland",
    country: "Norvège", flag: "🇳🇴",
    position: "ATT", rating: 94,
    rarity: "gold",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Erling_Haaland_June_2025.jpg/330px-Erling_Haaland_June_2025.jpg",
    stats: { PAC: 89, TIR: 97, PAS: 72, DRI: 86, DEF: 45, PHY: 97 },
  },
  {
    id: "mane",
    name: "Sadio Mané",
    country: "Sénégal", flag: "🇸🇳",
    position: "ATT", rating: 90,
    rarity: "gold",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sadio_Mane_Al-Nassr.jpg/330px-Sadio_Mane_Al-Nassr.jpg",
    stats: { PAC: 95, TIR: 87, PAS: 82, DRI: 91, DEF: 45, PHY: 85 },
  },
  {
    id: "modric",
    name: "Luka Modrić",
    country: "Croatie", flag: "🇭🇷",
    position: "MIL", rating: 90,
    rarity: "gold",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg/330px-Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg",
    stats: { PAC: 74, TIR: 78, PAS: 93, DRI: 91, DEF: 72, PHY: 71 },
  },
  {
    id: "kane",
    name: "Harry Kane",
    country: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "ATT", rating: 91,
    rarity: "gold",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/330px-Harry_Kane_on_October_10%2C_2023.jpg",
    stats: { PAC: 70, TIR: 94, PAS: 83, DRI: 83, DEF: 47, PHY: 91 },
  },

  // ── ARGENT ────────────────────────────────────────────────────────────────
  {
    id: "salah",
    name: "Mohamed Salah",
    country: "Égypte", flag: "🇪🇬",
    position: "ATT", rating: 89,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mohamed_Salah_2018.jpg/330px-Mohamed_Salah_2018.jpg",
    stats: { PAC: 93, TIR: 88, PAS: 82, DRI: 91, DEF: 45, PHY: 77 },
  },
  {
    id: "debruyne",
    name: "Kevin De Bruyne",
    country: "Belgique", flag: "🇧🇪",
    position: "MIL", rating: 91,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg/330px-Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg",
    stats: { PAC: 76, TIR: 86, PAS: 96, DRI: 88, DEF: 64, PHY: 78 },
  },
  {
    id: "griezmann",
    name: "Antoine Griezmann",
    country: "France", flag: "🇫🇷",
    position: "ATT", rating: 87,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/FRA-ARG_%2810%29_%28cropped%29.jpg/330px-FRA-ARG_%2810%29_%28cropped%29.jpg",
    stats: { PAC: 83, TIR: 87, PAS: 84, DRI: 87, DEF: 58, PHY: 77 },
  },
  {
    id: "vandijk",
    name: "Virgil van Dijk",
    country: "Pays-Bas", flag: "🇳🇱",
    position: "DEF", rating: 89,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/20160604_AUT_NED_8876_%28cropped%29.jpg/330px-20160604_AUT_NED_8876_%28cropped%29.jpg",
    stats: { PAC: 77, TIR: 60, PAS: 71, DRI: 72, DEF: 93, PHY: 95 },
  },
  {
    id: "koulibaly",
    name: "Kalidou Koulibaly",
    country: "Sénégal", flag: "🇸🇳",
    position: "DEF", rating: 86,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Joueur_de_foot.jpg/330px-Joueur_de_foot.jpg",
    stats: { PAC: 78, TIR: 43, PAS: 62, DRI: 65, DEF: 90, PHY: 93 },
  },
  {
    id: "lewandowski",
    name: "Robert Lewandowski",
    country: "Pologne", flag: "🇵🇱",
    position: "ATT", rating: 90,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2019147183134_2019-05-27_Fussball_1.FC_Kaiserslautern_vs_FC_Bayern_M%C3%BCnchen_-_Sven_-_1D_X_MK_II_-_0228_-_B70I8527_%28cropped%29.jpg/330px-2019147183134_2019-05-27_Fussball_1.FC_Kaiserslautern_vs_FC_Bayern_M%C3%BCnchen_-_Sven_-_1D_X_MK_II_-_0228_-_B70I8527_%28cropped%29.jpg",
    stats: { PAC: 75, TIR: 94, PAS: 79, DRI: 85, DEF: 44, PHY: 90 },
  },
  {
    id: "neymar",
    name: "Neymar Jr",
    country: "Brésil", flag: "🇧🇷",
    position: "ATT", rating: 87,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg/330px-Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg",
    stats: { PAC: 88, TIR: 85, PAS: 87, DRI: 95, DEF: 37, PHY: 68 },
  },

  // ── BRONZE ────────────────────────────────────────────────────────────────
  {
    id: "aliou-cisse",
    name: "Aliou Cissé",
    country: "Sénégal", flag: "🇸🇳",
    position: "ENT", rating: 75,
    rarity: "bronze",
    image: null,
    stats: { PAC: 60, TIR: 55, PAS: 70, DRI: 60, DEF: 78, PHY: 72 },
  },
  {
    id: "ismaila-sarr",
    name: "Ismaïla Sarr",
    country: "Sénégal", flag: "🇸🇳",
    position: "ATT", rating: 78,
    rarity: "bronze",
    image: null,
    stats: { PAC: 95, TIR: 75, PAS: 72, DRI: 82, DEF: 32, PHY: 74 },
  },
  {
    id: "dembele",
    name: "Ousmane Dembélé",
    country: "France", flag: "🇫🇷",
    position: "ATT", rating: 84,
    rarity: "bronze",
    image: null,
    stats: { PAC: 96, TIR: 83, PAS: 79, DRI: 89, DEF: 35, PHY: 70 },
  },
  {
    id: "pedri",
    name: "Pedri",
    country: "Espagne", flag: "🇪🇸",
    position: "MIL", rating: 85,
    rarity: "bronze",
    image: "/Players/Pedri.jpg",
    stats: { PAC: 78, TIR: 74, PAS: 88, DRI: 88, DEF: 67, PHY: 65 },
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    country: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "MIL", rating: 88,
    rarity: "bronze",
    image: null,
    stats: { PAC: 80, TIR: 84, PAS: 85, DRI: 88, DEF: 75, PHY: 83 },
  },
  {
    id: "osimhen",
    name: "Victor Osimhen",
    country: "Nigeria", flag: "🇳🇬",
    position: "ATT", rating: 86,
    rarity: "bronze",
    image: null,
    stats: { PAC: 91, TIR: 87, PAS: 65, DRI: 83, DEF: 35, PHY: 88 },
  },
  {
    id: "diallo",
    name: "Seko Fofana",
    country: "Côte d'Ivoire", flag: "🇨🇮",
    position: "MIL", rating: 78,
    rarity: "bronze",
    image: null,
    stats: { PAC: 82, TIR: 72, PAS: 80, DRI: 80, DEF: 70, PHY: 85 },
  },
  {
    id: "hakimi",
    name: "Achraf Hakimi",
    country: "Maroc", flag: "🇲🇦",
    position: "DEF", rating: 85,
    rarity: "bronze",
    image: null,
    stats: { PAC: 95, TIR: 72, PAS: 78, DRI: 83, DEF: 79, PHY: 78 },
  },
  // ── JOUEURS SÉNÉGALAIS ───────────────────────────────────────────────────
  {
    id: "mane",
    name: "Sadio Mané",
    country: "Sénégal", flag: "🇸🇳",
    position: "ATT", rating: 90,
    rarity: "gold",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Esteghlal_F.C._v_Al_Nassr_FC%2C_3_March_2025%2C_Sadio_Man%C3%A9_%28cropped%29.jpg/440px-Esteghlal_F.C._v_Al_Nassr_FC%2C_3_March_2025%2C_Sadio_Man%C3%A9_%28cropped%29.jpg",
    stats: { PAC: 95, TIR: 87, PAS: 82, DRI: 91, DEF: 45, PHY: 85 },
  },
  {
    id: "koulibaly",
    name: "Kalidou Koulibaly",
    country: "Sénégal", flag: "🇸🇳",
    position: "DEF", rating: 86,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/thirty/Kalidou_Koulibaly.jpg/440px-Kalidou_Koulibaly.jpg",
    stats: { PAC: 78, TIR: 43, PAS: 62, DRI: 65, DEF: 90, PHY: 93 },
  },
  {
    id: "isarr",
    name: "Ismaïla Sarr",
    country: "Sénégal", flag: "🇸🇳",
    position: "ATT", rating: 82,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ismaila_Sarr_2019.jpg/440px-Ismaila_Sarr_2019.jpg",
    stats: { PAC: 95, TIR: 78, PAS: 72, DRI: 85, DEF: 32, PHY: 74 },
  },
  {
    id: "gana",
    name: "Idrissa Gana Gueye",
    country: "Sénégal", flag: "🇸🇳",
    position: "MIL", rating: 82,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Idrissa_Gana_Gueye.jpg/440px-Idrissa_Gana_Gueye.jpg",
    stats: { PAC: 80, TIR: 68, PAS: 78, DRI: 76, DEF: 85, PHY: 88 },
  },
  {
    id: "psarr",
    name: "Pape Sarr",
    country: "Sénégal", flag: "🇸🇳",
    position: "MIL", rating: 78,
    rarity: "bronze",
    image: null,
    stats: { PAC: 82, TIR: 72, PAS: 80, DRI: 79, DEF: 68, PHY: 80 },
  },
  {
    id: "njackson",
    name: "Nicolas Jackson",
    country: "Sénégal", flag: "🇸🇳",
    position: "ATT", rating: 80,
    rarity: "bronze",
    image: null,
    stats: { PAC: 88, TIR: 80, PAS: 68, DRI: 82, DEF: 30, PHY: 82 },
  },
  {
    id: "mendy",
    name: "Édouard Mendy",
    country: "Sénégal", flag: "🇸🇳",
    position: "GK", rating: 84,
    rarity: "silver",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/%C3%89douard_Mendy.jpg/440px-%C3%89douard_Mendy.jpg",
    stats: { PAC: 55, TIR: 20, PAS: 45, DRI: 30, DEF: 88, PHY: 85 },
  },
  {
    id: "lcamara",
    name: "Lamine Camara",
    country: "Sénégal", flag: "🇸🇳",
    position: "MIL", rating: 76,
    rarity: "bronze",
    image: null,
    stats: { PAC: 80, TIR: 70, PAS: 78, DRI: 78, DEF: 65, PHY: 78 },
  },
];

// Packs disponibles
export const PACKS = [
  {
    id:    "bronze",
    name:  "Pack Bronze",
    emoji: "🟫",
    cost:  100,
    cards: 3,
    desc:  "3 cartes · Chance d'Argent",
    probabilities: { bronze: 0.85, silver: 0.14, gold: 0.01, legendary: 0 },
    color: "from-amber-800 to-amber-600",
    border: "border-amber-600/40",
  },
  {
    id:    "silver",
    name:  "Pack Argent",
    emoji: "⬜",
    cost:  300,
    cards: 3,
    desc:  "3 cartes · Garantie Argent",
    probabilities: { bronze: 0, silver: 0.75, gold: 0.24, legendary: 0.01 },
    color: "from-gray-500 to-gray-400",
    border: "border-gray-400/40",
    badge: "🔥 Populaire",
  },
  {
    id:    "senegal",
    name:  "Pack Lions 🇸🇳",
    emoji: "🦁",
    cost:  200,
    cards: 3,
    desc:  "3 cartes · 100% joueurs sénégalais",
    probabilities: { bronze: 0.40, silver: 0.45, gold: 0.15, legendary: 0 },
    color: "from-green-700 to-yellow-700",
    border: "border-green-400/40",
    badge: "🇸🇳 Exclusif",
    senegalOnly: true,
  },
  {
    id:    "gold",
    name:  "Pack Or",
    emoji: "🟨",
    cost:  800,
    cards: 3,
    desc:  "3 cartes · Garantie Or · Chance Légendaire",
    probabilities: { bronze: 0, silver: 0, gold: 0.85, legendary: 0.15 },
    color: "from-yellow-600 to-amber-500",
    border: "border-yellow-400/40",
    badge: "⭐ Premium",
  },
];

// Tirer une carte aléatoire selon les probabilités
export function drawCard(probabilities) {
  const rand = Math.random();
  let cumul  = 0;
  const order = ["legendary", "gold", "silver", "bronze"];

  for (const rarity of order) {
    cumul += probabilities[rarity] ?? 0;
    if (rand <= cumul) {
      const pool = PLAYERS.filter(p => p.rarity === rarity);
      if (pool.length === 0) continue;
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  // Fallback bronze
  const bronze = PLAYERS.filter(p => p.rarity === "bronze");
  return bronze[Math.floor(Math.random() * bronze.length)];
}

// Tirer une carte sénégalaise
export function drawSenegalCard(probabilities) {
  const rand  = Math.random();
  let cumul   = 0;
  const order = ["gold", "silver", "bronze"];
  const senegalPlayers = PLAYERS.filter(p => p.country === "Sénégal");

  for (const rarity of order) {
    cumul += probabilities[rarity] ?? 0;
    if (rand <= cumul) {
      const pool = senegalPlayers.filter(p => p.rarity === rarity);
      if (pool.length === 0) continue;
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  const fallback = senegalPlayers.filter(p => p.rarity === "bronze");
  return fallback[Math.floor(Math.random() * fallback.length)];
}

// Ouvrir un pack — retourne N cartes
export function openPack(pack) {
  const cards = [];
  for (let i = 0; i < pack.cards; i++) {
    if (pack.senegalOnly) {
      cards.push(drawSenegalCard(pack.probabilities));
    } else {
      cards.push(drawCard(pack.probabilities));
    }
  }
  return cards;
}
