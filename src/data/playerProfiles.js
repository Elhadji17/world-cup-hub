// src/data/playerProfiles.js
// Profils comportementaux individuels des joueurs sénégalais
// Basés sur les vraies données de la saison 2025-2026 et CdM 2026
// Chaque profil définit comment le joueur se déplace sur le terrain

export const PLAYER_PROFILES = {

  // ── GARDIEN ────────────────────────────────────────────────────────────
  "mendy_16": {
    name:        "É. Mendy",
    club:        "Al-Ahli",
    age:         32,
    // Forme récente sur 5 matchs sélection (1=mauvais, 10=parfait)
    recentForm:  [7.2, 6.8, 7.5, 7.0, 6.5], // Hésitant vs France (3-1)
    // Comportement sur le terrain
    montee:      0.05,  // ne monte presque jamais
    retour:      1.00,  // toujours dans sa cage
    vitesse:     0.65,
    rayonAction: 0.08,  // zone très restreinte (surface)
    largeur:     0.50,  // toujours centré
    // Points forts/faibles
    pointsForts: ["Arrêts réflexes", "Leadership défensif", "Commandes aériennes"],
    pointsFaibles: ["Relances aux pieds", "Sorties hasardeuses"],
    // Comportements spéciaux
    behaviours: {
      corner:        "sort_devant",    // sort de sa surface sur les corners
      pressing_haut: "reste_cage",     // ne monte jamais même en pressing haut
      contre:        "reste_cage",
    },
    // Position sur le terrain (0=gauche, 1=droite / 0=haut, 1=bas)
    zones:       ["centre_bas"],      // garde le centre-bas du terrain
  },

  // ── DÉFENSEURS ─────────────────────────────────────────────────────────
  "diatta_15": {
    name:        "K. Diatta",
    club:        "AS Monaco",
    age:         25,
    recentForm:  [7.0, 7.2, 6.8, 7.5, 6.9],
    montee:      0.72,  // latéral offensif — monte souvent
    retour:      0.85,  // retour discipliné
    vitesse:     0.88,
    rayonAction: 0.22,  // couvre tout le couloir droit
    largeur:     0.88,  // toujours sur le côté droit
    pointsForts: ["Débordements côté droit", "Vitesse", "Centres"],
    pointsFaibles: ["Défense en 1v1 face à un ailier rapide"],
    behaviours: {
      pressing_haut: "monte_couloir",
      attaque:       "monte_couloir",
      defence:       "reste_ligne",
      corner:        "monte_surface",
    },
    zones: ["couloir_droit", "mi_droit"],
  },

  "koulibaly_3": {
    name:        "Koulibaly",
    club:        "Al-Hilal",
    age:         35,
    // Brassard de capitaine — leader
    recentForm:  [8.0, 7.8, 7.2, 7.5, 6.2], // Difficile vs France (3-1)
    montee:      0.12,  // ne monte quasiment jamais — gardien de la ligne
    retour:      0.99,
    vitesse:     0.68,  // a perdu en vitesse mais placement parfait
    rayonAction: 0.14,
    largeur:     0.38,  // axe gauche-centre
    pointsForts: ["Leadership", "Duels aériens", "Placement", "Relance longue"],
    pointsFaibles: ["Vitesse dans le dos", "Pressing intense"],
    behaviours: {
      pressing_haut: "reste_ligne_haute",  // monte la ligne mais ne se projette pas
      corner_off:    "monte_surface",       // monte sur les corners offensifs
      corner_def:    "reste_ligne",
      contre:        "reste_ligne",
    },
    zones: ["axe_gauche_centre", "centre"],
    // Note leadership — influence les autres défenseurs
    leadership:  0.95,
  },

  "niakhate_19": {
    name:        "M. Niakhaté",
    club:        "OL",
    age:         28,
    recentForm:  [7.0, 7.2, 7.5, 6.8, 7.0],
    montee:      0.18,
    retour:      0.98,
    vitesse:     0.74,
    rayonAction: 0.14,
    largeur:     0.62,  // axe droit-centre
    pointsForts: ["Duels physiques", "Vitesse relative", "Anticipation"],
    pointsFaibles: ["Relance courte sous pression"],
    behaviours: {
      pressing_haut: "reste_ligne_haute",
      corner_off:    "monte_surface",
      contre:        "reste_ligne",
    },
    zones: ["axe_droit_centre", "centre"],
  },

  "diouf_25": {
    name:        "M. Diouf",
    club:        "West Ham",
    age:         23,
    recentForm:  [7.1, 7.3, 7.0, 7.5, 6.8],
    montee:      0.65,  // latéral gauche offensif
    retour:      0.82,
    vitesse:     0.85,
    rayonAction: 0.20,
    largeur:     0.12,  // couloir gauche
    pointsForts: ["Montées sur le côté gauche", "Endurance", "Centres"],
    pointsFaibles: ["Défense en profondeur"],
    behaviours: {
      pressing_haut: "monte_couloir",
      attaque:       "monte_couloir",
      defence:       "reste_ligne",
    },
    zones: ["couloir_gauche", "mi_gauche"],
  },

  // ── MILIEUX ────────────────────────────────────────────────────────────
  "gueye_5": {
    name:        "I. Gueye",
    club:        "Everton",
    age:         39,
    recentForm:  [6.5, 6.9, 6.8, 7.1, 6.3],
    montee:      0.30,  // sentinelle — reste bas
    retour:      0.95,  // revient systématiquement
    vitesse:     0.70,
    rayonAction: 0.18,
    largeur:     0.45,  // légèrement à gauche du centre
    pointsForts: ["Récupération", "Interceptions", "Expérience", "Leadership"],
    pointsFaibles: ["Projection offensive", "Vitesse (âge)"],
    behaviours: {
      pressing_haut: "monte_milieu",  // monte le milieu mais pas plus
      attaque:       "reste_milieu",
      defence:       "couvre_centre",
      contre:        "reste_bas",
    },
    zones: ["milieu_centre", "milieu_gauche"],
    // Rôle de sentinelle — couvre les espaces derrière Camara
    role_special: "sentinelle",
  },

  "camara_8": {
    name:        "L. Camara",
    club:        "AS Monaco",
    age:         22,
    // En grande forme — révélation de ce Mondial
    recentForm:  [8.2, 7.9, 8.5, 8.0, 7.5],
    montee:      0.80,  // box-to-box — va partout
    retour:      0.88,
    vitesse:     0.84,
    rayonAction: 0.30,  // couvre énormément de terrain
    largeur:     0.52,  // légèrement à droite du centre
    pointsForts: ["Box-to-box", "Pressing", "Frappe", "Vision du jeu", "Endurance"],
    pointsFaibles: ["Parfois trop offensif — laisse des espaces"],
    behaviours: {
      pressing_haut: "monte_aggressif",  // premier au pressing
      attaque:       "monte_surface",    // se projette jusqu'en surface
      defence:       "couvre_milieu",
      contre:        "lance_attaque",    // déclenche les contres
    },
    zones: ["milieu_centre", "milieu_droit", "attaque_axe"],
    role_special: "box_to_box",
  },

  "gueye_26": {
    name:        "P. Gueye",
    club:        "Villarreal",
    age:         25,
    recentForm:  [7.0, 7.2, 7.1, 7.4, 6.6],
    montee:      0.55,
    retour:      0.80,
    vitesse:     0.78,
    rayonAction: 0.20,
    largeur:     0.35,  // milieu gauche
    pointsForts: ["Passes", "Relai", "Pressing"],
    pointsFaibles: ["Finition", "Un-contre-un défensif"],
    behaviours: {
      pressing_haut: "monte_milieu",
      attaque:       "soutien_attaque",
      contre:        "reste_milieu",
    },
    zones: ["milieu_gauche", "milieu_centre"],
  },

  // ── ATTAQUANTS ─────────────────────────────────────────────────────────
  "sarr_18": {
    name:        "I. Sarr",
    club:        "Crystal Palace",
    age:         26,
    recentForm:  [7.0, 6.8, 7.4, 7.1, 6.5],
    montee:      0.90,  // ailier droit — toujours en pointe
    retour:      0.45,  // retour défensif limité
    vitesse:     0.96,  // vitesse pure — l'un des plus rapides
    rayonAction: 0.25,
    largeur:     0.88,  // couloir droit offensif
    pointsForts: ["Vitesse pure", "1v1", "Débordements", "Centres"],
    pointsFaibles: ["Finition", "Jeu dos au but"],
    behaviours: {
      pressing_haut: "reste_large_haut",  // reste large et haut
      attaque:       "deborde_droite",
      defence:       "reste_haut",        // ne revient pas défendre
      contre:        "course_profondeur",
    },
    zones: ["couloir_droit_offensif"],
    vitesse_max: 0.97,
  },

  "jackson_11": {
    name:        "N. Jackson",
    club:        "Bayern Munich",
    age:         24,
    // 10 buts + 4 assists en 33 matchs Bayern — décisif
    recentForm:  [7.2, 7.5, 6.8, 7.8, 6.5],
    montee:      0.85,
    retour:      0.60,  // pressing mais ne revient pas systématiquement
    vitesse:     0.82,
    rayonAction: 0.28,
    largeur:     0.50,  // axe central mais mobile
    pointsForts: ["Pressing", "Appels dans le dos", "Pivot", "Finition"],
    pointsFaibles: ["Jeu de tête", "Régularité"],
    behaviours: {
      pressing_haut: "presse_defenseurs",   // premier au pressing sur les CB
      attaque:       "appel_profondeur",    // cours dans le dos de la défense
      contre:        "course_profondeur",
      corner:        "second_poteau",       // va au second poteau sur les corners
    },
    zones: ["axe_offensif", "mi_droit_offensif"],
    role_special: "pivot_mobile",
  },

  "mane_10": {
    name:        "S. Mané",
    club:        "Al-Nassr",
    age:         34,
    // En grande forme — 14 buts + 9 assists cette saison
    // Note FotMob 7.9 de moyenne — meilleure arme du Sénégal
    recentForm:  [7.5, 8.0, 7.2, 8.4, 6.8], // Moins bien vs France (3-1)
    montee:      0.88,
    retour:      0.55,  // compense vitesse perdue par l'expérience
    vitesse:     0.82,  // moins rapide qu'avant mais compense par la technique
    rayonAction: 0.30,
    largeur:     0.14,  // couloir gauche avec repiquages vers le centre
    pointsForts: ["Technique", "Vision du jeu", "Frappe", "Expérience", "Leadership offensif", "Grandes occasions"],
    pointsFaibles: ["Vitesse (a vieilli)", "Duels aériens"],
    behaviours: {
      pressing_haut: "pressing_intelligent",  // pressing ciblé, pas intensif
      attaque:       "repique_centre",         // rentre vers le centre pour frapper
      contre:        "acceleration_gauche",
      corner:        "tir_direct",             // tire les corners parfois directement
      pressing_haut_detail: "Mané presse intelligemment — cible le défenseur central pour forcer l'erreur",
    },
    zones: ["couloir_gauche", "axe_gauche_offensif"],
    role_special: "ailier_leader",
    // Cette CdM 2026 est sa dernière grande compétition
    motivation_bonus: 0.15, // bonus de motivation sur les grands matchs
  },
};

// ── Utilitaires ────────────────────────────────────────────────────────────

// Calcule la note live d'un joueur selon sa forme récente
export function getLiveRating(playerId) {
  const profile = PLAYER_PROFILES[playerId];
  if (!profile || !profile.recentForm) return 7.0;
  const avg = profile.recentForm.reduce((a, b) => a + b, 0) / profile.recentForm.length;
  return Math.round(avg * 10) / 10;
}

// Retourne le multiplicateur de forme (pour calcTeamStats)
export function getFormMultiplier(playerId) {
  const rating = getLiveRating(playerId);
  return Math.min(1.15, Math.max(0.85, 1.0 + (rating - 7.0) * 0.10));
}

// Retourne la position dynamique d'un joueur selon l'état tactique
// base = [x%, y%] position de base dans la formation
// state = état tactique actuel
export function getDynamicPosition(playerId, base, tacticalState) {
  const profile = PLAYER_PROFILES[playerId];
  if (!profile) return base;

  let [x, y] = base;
  const behaviour = profile.behaviours?.[tacticalState];

  switch (behaviour) {
    case "monte_couloir":
      y = Math.min(0.88, y + profile.montee * 0.25);
      x = profile.largeur;
      break;
    case "monte_surface":
      y = Math.min(0.88, y + 0.20);
      break;
    case "monte_aggressif":
      y = Math.min(0.85, y + 0.22);
      x = 0.5 + (x - 0.5) * 1.1;
      break;
    case "reste_ligne":
    case "reste_cage":
      y = base[1]; // position de base inchangée
      break;
    case "reste_ligne_haute":
      y = Math.min(base[1] + 0.08, 0.45);
      break;
    case "deborde_droite":
      x = Math.min(0.95, profile.largeur + 0.05);
      y = Math.min(0.90, y + 0.15);
      break;
    case "appel_profondeur":
    case "course_profondeur":
      y = Math.min(0.92, y + 0.25);
      x = 0.5 + (Math.random() - 0.5) * 0.2; // légère variation horizontale
      break;
    case "repique_centre":
      x = 0.5 + (x - 0.5) * 0.4; // rentre vers l'axe
      y = Math.min(0.85, y + 0.12);
      break;
    case "couvre_centre":
      x = 0.5;
      y = Math.max(0.35, base[1]);
      break;
    case "lance_attaque":
      y = Math.min(0.75, y + 0.18);
      break;
    case "presse_defenseurs":
      y = Math.min(0.82, y + 0.20);
      break;
    case "second_poteau":
      x = 0.75;
      y = Math.min(0.90, y + 0.22);
      break;
    default:
      break;
  }

  return [
    Math.min(0.95, Math.max(0.05, x)),
    Math.min(0.95, Math.max(0.05, y)),
  ];
}

// Retourne une description textuelle du comportement actuel
export function getBehaviourDescription(playerId, tacticalState) {
  const profile = PLAYER_PROFILES[playerId];
  if (!profile) return "";

  const descriptions = {
    "monte_couloir":        `${profile.name} monte dans le couloir`,
    "monte_aggressif":      `${profile.name} monte au pressing agressif`,
    "monte_surface":        `${profile.name} se projette en surface`,
    "reste_ligne":          `${profile.name} tient sa ligne`,
    "reste_cage":           `${profile.name} reste dans ses cages`,
    "deborde_droite":       `${profile.name} déborde côté droit`,
    "appel_profondeur":     `${profile.name} appelle dans le dos`,
    "repique_centre":       `${profile.name} rentre vers le centre`,
    "presse_defenseurs":    `${profile.name} presse le CB adverse`,
    "couvre_centre":        `${profile.name} couvre le centre`,
    "lance_attaque":        `${profile.name} déclenche le contre`,
    "course_profondeur":    `${profile.name} part en profondeur`,
    "second_poteau":        `${profile.name} attaque le second poteau`,
  };

  const behaviour = profile.behaviours?.[tacticalState];
  return descriptions[behaviour] ?? "";
}
