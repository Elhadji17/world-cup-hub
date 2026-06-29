// src/data/playerProfiles.js
// Profils complets — système de paramètres numériques (0-100) par joueur
// + 6 phases de jeu + modificateurs par formation
// Inspiré de EA SPORTS FC / Football Manager

// ── Les 6 phases de jeu ───────────────────────────────────────────────────
// 1. construction    : gardien → défense (on a le ballon bas)
// 2. progression     : défense → milieu (on monte)
// 3. attaque_placee  : on attaque organisé
// 4. contre_attaque  : transition offensive rapide
// 5. transition_def  : on vient de perdre le ballon
// 6. defence_placee  : l'adversaire attaque organisé

// ── Paramètres de déplacement (0-100) ────────────────────────────────────
// largeur_off      : à quel point le joueur s'écarte latéralement en attaque
// profondeur_off   : à quel point il monte vers le but adverse
// decrochage       : tendance à décrocher vers son camp pour recevoir
// rentrer_axe      : tendance à rentrer dans l'axe depuis un côté
// pressing         : intensité du pressing haut
// repli_def        : à quel point il revient défendre
// course_profondeur: tendance à partir dans le dos de la défense adverse
// contre_vitesse   : vitesse de transition en contre-attaque

export const PLAYER_PROFILES = {

  // ── GARDIENS ───────────────────────────────────────────────────────────
  "mendy_16": {
    name: "É. Mendy", number: 16, position: "GK", age: 32,
    club: "Al-Ahli", pied: "Droit",
    formNote: 6.9, injured: true, // Blessé vs Irak
    ratingBase: 82,
    // Paramètres comportementaux
    params: {
      largeur_off: 0, profondeur_off: 5, decrochage: 0,
      rentrer_axe: 0, pressing: 10, repli_def: 100,
      course_profondeur: 0, contre_vitesse: 10,
    },
    // Phases de jeu
    phases: {
      construction:   { x: 0.50, y: 0.06, role: "Relance courte ou longue" },
      progression:    { x: 0.50, y: 0.07, role: "Reste dans sa cage" },
      attaque_placee: { x: 0.50, y: 0.06, role: "Reste dans sa cage" },
      contre_attaque: { x: 0.50, y: 0.06, role: "Prêt à relancer vite" },
      transition_def: { x: 0.50, y: 0.05, role: "Recule dans sa cage" },
      defence_placee: { x: 0.50, y: 0.05, role: "Position de gardien" },
    },
    // Modificateurs par formation (ajoutés aux phases de base)
    formation_mods: {
      "4-3-3":   { profondeur_off: 0 },
      "3-4-3":   { profondeur_off: 5 }, // légèrement plus haut comme libéro
      "4-2-3-1": { profondeur_off: 0 },
    },
    pointsForts: ["Réflexes ★★★★★", "Jeu aérien ★★★★★", "Face-à-face ★★★★★"],
    pointsFaibles: ["Relances sous pression", "Jeu au pied"],
    traits: ["Shot Stopper", "Command Area"],
    stats: { pac: 58, tir: 15, pas: 62, dri: 42, def: 88, phy: 84 },
  },

  "diaw_23": {
    name: "M. Diaw", number: 23, position: "GK", age: 29,
    club: "Metz", pied: "Droit",
    formNote: 7.5, injured: false,
    ratingBase: 74,
    params: {
      largeur_off: 0, profondeur_off: 5, decrochage: 0,
      rentrer_axe: 0, pressing: 8, repli_def: 100,
      course_profondeur: 0, contre_vitesse: 10,
    },
    phases: {
      construction:   { x: 0.50, y: 0.06, role: "Relance" },
      progression:    { x: 0.50, y: 0.07, role: "Reste en cage" },
      attaque_placee: { x: 0.50, y: 0.06, role: "Reste en cage" },
      contre_attaque: { x: 0.50, y: 0.06, role: "Relance rapide" },
      transition_def: { x: 0.50, y: 0.05, role: "Recule" },
      defence_placee: { x: 0.50, y: 0.05, role: "Position gardien" },
    },
    formation_mods: { "4-3-3": {}, "4-2-3-1": {} },
    pointsForts: ["Réflexes corrects", "Sang-froid"],
    pointsFaibles: ["Expérience internationale limitée"],
    traits: ["Shot Stopper"],
    stats: { pac: 55, tir: 12, pas: 58, dri: 38, def: 76, phy: 74 },
  },

  // ── DÉFENSEURS ─────────────────────────────────────────────────────────
  "diatta_15": {
    name: "K. Diatta", number: 15, position: "DEF", age: 25,
    club: "AS Monaco", pied: "Droit",
    formNote: 7.3, injured: false,
    ratingBase: 78,
    params: {
      largeur_off: 92,  // reste très large à droite
      profondeur_off: 78, // monte haut
      decrochage: 20,
      rentrer_axe: 30,  // reste sur son couloir
      pressing: 72,
      repli_def: 82,
      course_profondeur: 70,
      contre_vitesse: 86,
    },
    phases: {
      construction:   { x: 0.88, y: 0.18, role: "Latéral haut, offre une option" },
      progression:    { x: 0.90, y: 0.30, role: "Monte dans le couloir droit" },
      attaque_placee: { x: 0.92, y: 0.52, role: "Très haut, prêt à déborder" },
      contre_attaque: { x: 0.88, y: 0.62, role: "Sprint couloir droit" },
      transition_def: { x: 0.86, y: 0.38, role: "Revient rapidement" },
      defence_placee: { x: 0.84, y: 0.20, role: "Tient sa ligne à droite" },
    },
    formation_mods: {
      "4-3-3":   { profondeur_off: 0, largeur_off: 0 },
      "4-2-3-1": { profondeur_off: -5 }, // un peu moins haut
      "5-3-2":   { profondeur_off: -15, pressing: -20 }, // défend plus
    },
    pointsForts: ["Débordements couloir droit ★★★★★", "Vitesse ★★★★★", "Centres ★★★★"],
    pointsFaibles: ["Défense en profondeur", "Duels aériens"],
    traits: ["Speed Dribbler", "Overlap", "Cross Specialist"],
    stats: { pac: 84, tir: 52, pas: 72, dri: 78, def: 74, phy: 78 },
  },

  "koulibaly_3": {
    name: "Koulibaly", number: 3, position: "DEF", age: 35,
    club: "Al-Hilal", pied: "Droit",
    formNote: 7.8, injured: false,
    ratingBase: 83,
    params: {
      largeur_off: 38,  // axe gauche-centre
      profondeur_off: 12, // monte très peu
      decrochage: 5,
      rentrer_axe: 85,  // toujours dans l'axe
      pressing: 35,
      repli_def: 98,    // revient toujours
      course_profondeur: 5,
      contre_vitesse: 40,
    },
    phases: {
      construction:   { x: 0.36, y: 0.18, role: "Relance longue ou passe au milieu" },
      progression:    { x: 0.38, y: 0.22, role: "Monte légèrement la ligne" },
      attaque_placee: { x: 0.36, y: 0.28, role: "Garde la ligne — ne sort pas" },
      contre_attaque: { x: 0.36, y: 0.18, role: "RESTE — couvre les espaces" },
      transition_def: { x: 0.38, y: 0.16, role: "Recule, réorganise la défense" },
      defence_placee: { x: 0.36, y: 0.16, role: "Axe gauche-centre, tient la ligne" },
      // Exception : corner offensif — son seul moment offensif
      corner_off:     { x: 0.42, y: 0.86, role: "Monte pour le duel aérien !" },
    },
    formation_mods: {
      "4-3-3":   { profondeur_off: 0 },
      "3-5-2":   { profondeur_off: 5, largeur_off: 10 }, // libéro — couvre plus large
    },
    pointsForts: ["Duels aériens ★★★★★", "Puissance ★★★★★", "Leadership ★★★★★"],
    pointsFaibles: ["Accélération", "Ballons dans le dos", "Vitesse (âge)"],
    traits: ["Leadership", "Aerial Duel", "Line Controller"],
    leadership: 98,
    stats: { pac: 72, tir: 38, pas: 68, dri: 62, def: 90, phy: 90 },
  },

  "niakhate_19": {
    name: "M. Niakhaté", number: 19, position: "DEF", age: 28,
    club: "OL", pied: "Gauche",
    formNote: 7.8, injured: false,
    ratingBase: 79,
    params: {
      largeur_off: 62,
      profondeur_off: 16,
      decrochage: 8,
      rentrer_axe: 80,
      pressing: 40,
      repli_def: 96,
      course_profondeur: 8,
      contre_vitesse: 52,
    },
    phases: {
      construction:   { x: 0.64, y: 0.18, role: "Relance ou passe courte" },
      progression:    { x: 0.62, y: 0.22, role: "Monte la ligne" },
      attaque_placee: { x: 0.62, y: 0.28, role: "Garde la ligne" },
      contre_attaque: { x: 0.62, y: 0.18, role: "Couvre les espaces" },
      transition_def: { x: 0.62, y: 0.16, role: "Recule rapidement" },
      defence_placee: { x: 0.62, y: 0.16, role: "Axe droit-centre" },
      corner_off:     { x: 0.56, y: 0.82, role: "Monte pour le duel aérien" },
    },
    formation_mods: {
      "4-3-3":   {},
      "3-5-2":   { largeur_off: 5 },
    },
    pointsForts: ["Duels physiques ★★★★", "Jeu de tête ★★★★", "Vitesse relative"],
    pointsFaibles: ["Relance sous pression", "Concentration parfois"],
    traits: ["Aerial Duel", "Physical Duel"],
    stats: { pac: 74, tir: 35, pas: 64, dri: 58, def: 84, phy: 86 },
  },

  "diouf_25": {
    name: "M. Diouf", number: 25, position: "DEF", age: 23,
    club: "West Ham", pied: "Gauche",
    formNote: 7.3, injured: false,
    ratingBase: 77,
    params: {
      largeur_off: 88,
      profondeur_off: 72,
      decrochage: 22,
      rentrer_axe: 25,
      pressing: 68,
      repli_def: 80,
      course_profondeur: 65,
      contre_vitesse: 84,
    },
    phases: {
      construction:   { x: 0.12, y: 0.18, role: "Option latérale gauche" },
      progression:    { x: 0.10, y: 0.30, role: "Monte dans le couloir gauche" },
      attaque_placee: { x: 0.08, y: 0.50, role: "Très haut, soutient Mané" },
      contre_attaque: { x: 0.10, y: 0.58, role: "Sprint couloir gauche" },
      transition_def: { x: 0.12, y: 0.36, role: "Revient dans son couloir" },
      defence_placee: { x: 0.14, y: 0.20, role: "Tient sa ligne à gauche" },
    },
    formation_mods: {
      "4-3-3":   {},
      "5-3-2":   { profondeur_off: -15, pressing: -20 },
    },
    pointsForts: ["Montées couloir gauche ★★★★", "Vitesse", "Centres"],
    pointsFaibles: ["Défense en profondeur"],
    traits: ["Overlap", "High Work Rate"],
    stats: { pac: 82, tir: 44, pas: 68, dri: 72, def: 70, phy: 74 },
  },

  // ── MILIEUX ────────────────────────────────────────────────────────────
  "gueye_5": {
    name: "I. Gueye", number: 5, position: "MIL", age: 39,
    club: "Everton", pied: "Droit",
    formNote: 7.7, injured: false,
    ratingBase: 76,
    params: {
      largeur_off: 45,
      profondeur_off: 25,  // milieu défensif — monte peu
      decrochage: 60,      // décroche souvent pour recevoir
      rentrer_axe: 90,     // toujours dans l'axe
      pressing: 55,
      repli_def: 95,
      course_profondeur: 15,
      contre_vitesse: 45,
    },
    phases: {
      construction:   { x: 0.46, y: 0.32, role: "Reçoit et redistribue" },
      progression:    { x: 0.46, y: 0.36, role: "Filtre le jeu au milieu" },
      attaque_placee: { x: 0.46, y: 0.38, role: "Couvre derrière Camara" },
      contre_attaque: { x: 0.46, y: 0.30, role: "RESTE — protège la défense" },
      transition_def: { x: 0.46, y: 0.32, role: "Récupère le ballon" },
      defence_placee: { x: 0.48, y: 0.34, role: "Sentinelle — couvre les latéraux" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": { profondeur_off: -5 }, // encore plus défensif en double pivot
      "4-4-2":   { largeur_off: 10 },
    },
    pointsForts: ["Récupération ★★★★★", "Interceptions ★★★★★", "Endurance ★★★★"],
    pointsFaibles: ["Buts", "Frappes", "Vitesse (âge)"],
    traits: ["Ball Winner", "Interception", "Defensive Midfielder"],
    role_special: "sentinelle",
    stats: { pac: 70, tir: 55, pas: 76, dri: 68, def: 84, phy: 82 },
  },

  "camara_8": {
    name: "L. Camara", number: 8, position: "MIL", age: 22,
    club: "AS Monaco", pied: "Droit",
    formNote: 8.8, injured: false,
    ratingBase: 82,
    params: {
      largeur_off: 55,
      profondeur_off: 78,  // box-to-box — monte beaucoup
      decrochage: 45,
      rentrer_axe: 65,
      pressing: 86,        // premier au pressing
      repli_def: 86,
      course_profondeur: 60,
      contre_vitesse: 82,
    },
    phases: {
      construction:   { x: 0.52, y: 0.34, role: "Reçoit et fait circuler" },
      progression:    { x: 0.52, y: 0.42, role: "Monte avec le ballon" },
      attaque_placee: { x: 0.54, y: 0.58, role: "Se projette jusqu'en surface" },
      contre_attaque: { x: 0.52, y: 0.62, role: "Lance le contre rapidement" },
      transition_def: { x: 0.52, y: 0.40, role: "Presse immédiatement" },
      defence_placee: { x: 0.50, y: 0.38, role: "Couvre large devant la défense" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": { profondeur_off: -10 }, // moins offensif en double pivot
      "3-4-3":   { profondeur_off: +5, largeur_off: +15 }, // couvre les pistons
    },
    pointsForts: ["Vision ★★★★★", "Passes ★★★★★", "Endurance ★★★★", "Box-to-box"],
    pointsFaibles: ["Jeu aérien", "Parfois trop offensif"],
    traits: ["Box-to-Box", "Long Pass", "Through Ball", "High Stamina"],
    role_special: "box_to_box",
    stats: { pac: 82, tir: 76, pas: 86, dri: 82, def: 72, phy: 80 },
  },

  "diarra_21": {
    name: "H. Diarra", number: 21, position: "MIL", age: 21,
    club: "Sunderland", pied: "Droit",
    formNote: 8.0, injured: false,
    ratingBase: 77,
    params: {
      largeur_off: 68,
      profondeur_off: 70,
      decrochage: 35,
      rentrer_axe: 55,
      pressing: 88,
      repli_def: 76,
      course_profondeur: 58,
      contre_vitesse: 82,
    },
    phases: {
      construction:   { x: 0.62, y: 0.34, role: "Milieu droit — reçoit et joue simple" },
      progression:    { x: 0.64, y: 0.44, role: "Monte avec énergie" },
      attaque_placee: { x: 0.62, y: 0.56, role: "Projection vers la surface" },
      contre_attaque: { x: 0.64, y: 0.62, role: "Sprint direct vers le but" },
      transition_def: { x: 0.62, y: 0.38, role: "Presse intensément" },
      defence_placee: { x: 0.60, y: 0.36, role: "Couvre milieu droit" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": { profondeur_off: +10 }, // plus offensif
    },
    pointsForts: ["Frappe ★★★★", "Pressing ★★★★", "Explosivité", "Énergie"],
    pointsFaibles: ["Expérience internationale", "Décision sous pression"],
    traits: ["Long Shot", "High Press", "Energetic"],
    stats: { pac: 80, tir: 76, pas: 72, dri: 78, def: 64, phy: 78 },
  },

  "gueye_26": {
    name: "P. Gueye", number: 26, position: "MIL", age: 25,
    club: "Villarreal", pied: "Droit",
    formNote: 8.5, injured: false, // Doublé vs Irak !
    ratingBase: 79,
    params: {
      largeur_off: 42,
      profondeur_off: 68,
      decrochage: 40,
      rentrer_axe: 60,
      pressing: 72,
      repli_def: 78,
      course_profondeur: 65,
      contre_vitesse: 78,
    },
    phases: {
      construction:   { x: 0.38, y: 0.34, role: "Reçoit et fait circuler" },
      progression:    { x: 0.36, y: 0.44, role: "Monte milieu gauche" },
      attaque_placee: { x: 0.38, y: 0.58, role: "Se projette, cherche la frappe" },
      contre_attaque: { x: 0.36, y: 0.62, role: "Projection rapide" },
      transition_def: { x: 0.38, y: 0.38, role: "Presse, récupère" },
      defence_placee: { x: 0.40, y: 0.36, role: "Milieu gauche défensif" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": { profondeur_off: +8 },
    },
    pointsForts: ["Projection ★★★★", "Frappe lointaine ★★★★", "Physique ★★★★"],
    pointsFaibles: ["Laisse des espaces derrière", "1v1 défensif"],
    traits: ["Long Shot", "Box-to-Box", "Goal Threat"],
    stats: { pac: 76, tir: 80, pas: 80, dri: 74, def: 60, phy: 78 },
  },

  // ── ATTAQUANTS ─────────────────────────────────────────────────────────
  "sarr_18": {
    name: "I. Sarr", number: 18, position: "ATT", age: 26,
    club: "Crystal Palace", pied: "Droit",
    formNote: 9.5, injured: false, // MEILLEUR LION DU TOURNOI
    ratingBase: 85,
    // Table de paramètres EA FC / FM
    params: {
      largeur_off: 95,        // reste très large à droite
      profondeur_off: 95,     // va très haut
      decrochage: 15,         // ne décroche presque jamais
      rentrer_axe: 70,        // rentre dans l'axe pour frapper en 4-2-3-1
      pressing: 82,
      repli_def: 42,          // revient peu
      course_profondeur: 96,  // appels constants dans le dos
      contre_vitesse: 98,     // le plus rapide en transition
    },
    // 6 phases de jeu — 4-3-3 (formation de base)
    phases: {
      // Construction : Sarr attend loin devant, très large
      construction:   { x: 0.92, y: 0.48, role: "Attend large à droite — ne descend pas" },
      // Progression : commence à attaquer l'espace
      progression:    { x: 0.90, y: 0.58, role: "Demande le ballon dans les pieds" },
      // Attaque placée : reste très large, élimination + centre ou frappe
      attaque_placee: { x: 0.94, y: 0.72, role: "Éliminer le latéral → centrer ou rentrer" },
      // Contre-attaque : sprint immédiat côté droit, ne touche pas l'axe
      contre_attaque: { x: 0.90, y: 0.80, role: "SPRINT — couloir droit uniquement !" },
      // Transition défensive : revient seulement jusqu'à son milieu
      transition_def: { x: 0.88, y: 0.55, role: "Revient au milieu seulement" },
      // Défense placée : ferme la ligne de passe du latéral adverse
      defence_placee: { x: 0.86, y: 0.45, role: "Ferme ligne de passe du latéral gauche adverse" },
    },
    // Modificateurs par formation — MODIFIENT les phases de base
    formation_mods: {
      "4-3-3":   {
        // Position de base — aucune modification
      },
      "4-2-3-1": {
        // Joue plus intérieur — combine avec le N°10
        rentrer_axe: +18,      // rentre davantage vers le centre
        decrochage: +15,       // décroche plus souvent
        phase_attaque_x: 0.80, // moins large
      },
      "3-4-3": {
        // Le piston occupe son couloir → Sarr rentre dans l'axe
        rentrer_axe: +30,      // devient quasi 2e attaquant
        largeur_off: -20,
        phase_attaque_x: 0.68,
      },
      "5-4-1": {
        // Défend beaucoup plus
        repli_def: +30,
        profondeur_off: -20,
        pressing: -10,
      },
    },
    pointsForts: ["Vitesse ★★★★★", "Dribbles ★★★★★", "Appels ★★★★", "Centres ★★★★"],
    pointsFaibles: ["Finition irrégulière", "Jeu dos au but"],
    traits: ["Speed Dribbler", "Counter Attack", "Long Sprint", "Cut Inside"],
    stats: { pac: 96, tir: 80, pas: 72, dri: 90, def: 38, phy: 72 },
  },

  "jackson_11": {
    name: "N. Jackson", number: 11, position: "ATT", age: 24,
    club: "Bayern Munich", pied: "Droit",
    formNote: 7.2, injured: false,
    ratingBase: 81,
    params: {
      largeur_off: 50,
      profondeur_off: 90,
      decrochage: 55,      // décroche pour combiner
      rentrer_axe: 50,
      pressing: 90,        // pressing intense sur les CB
      repli_def: 48,
      course_profondeur: 88,
      contre_vitesse: 86,
    },
    phases: {
      construction:   { x: 0.50, y: 0.50, role: "Appels dans le dos, pressing GK adverse" },
      progression:    { x: 0.50, y: 0.62, role: "Demande la profondeur ou décroche" },
      attaque_placee: { x: 0.50, y: 0.72, role: "Axe central — attend le centre ou la passe" },
      contre_attaque: { x: 0.50, y: 0.82, role: "Course profondeur axe — max vitesse" },
      transition_def: { x: 0.50, y: 0.55, role: "Pressing immédiat sur le porteur" },
      defence_placee: { x: 0.50, y: 0.48, role: "Haut dans l'axe — prêt au contre" },
      corner_off:     { x: 0.75, y: 0.88, role: "Second poteau — attaque le centre" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": { decrochage: +15 }, // plus de décrochages pour combiner avec le N°10
      "3-5-2":   { largeur_off: +15 }, // attaque le côté droit
    },
    pointsForts: ["Pressing ★★★★", "Appels profondeur ★★★★", "Vitesse", "Pivot"],
    pointsFaibles: ["Finition ★★ (irrégulier)", "Contrôle dos au but", "Jeu de tête"],
    traits: ["Pressing", "Run In Behind", "Mobile Striker"],
    role_special: "pivot_mobile",
    stats: { pac: 86, tir: 82, pas: 64, dri: 80, def: 34, phy: 84 },
  },

  "mane_10": {
    name: "S. Mané", number: 10, position: "ATT", age: 34,
    club: "Al-Nassr", pied: "Droit", // Pied fort DROIT malgré ailier gauche !
    formNote: 8.6, injured: false,
    ratingBase: 85,
    params: {
      largeur_off: 25,        // part du couloir gauche mais...
      profondeur_off: 85,
      decrochage: 78,         // DÉCROCHE ÉNORMÉMENT — signature Mané
      rentrer_axe: 88,        // rentre toujours vers le centre pour frapper du pied droit
      pressing: 76,
      repli_def: 50,
      course_profondeur: 80,
      contre_vitesse: 82,
    },
    phases: {
      // Construction : Mané décroche énormément pour recevoir
      construction:   { x: 0.20, y: 0.46, role: "Décroche pour recevoir et combiner" },
      // Progression : échange souvent avec Jackson
      progression:    { x: 0.22, y: 0.56, role: "Échange avec Jackson, demande la profondeur" },
      // Attaque placée : rentre vers le centre pour frapper du pied droit
      attaque_placee: { x: 0.32, y: 0.72, role: "Rentre dans l'axe → frappe pied droit" },
      // Contre-attaque : diagonale gauche → axe
      contre_attaque: { x: 0.24, y: 0.80, role: "Accélération diagonale gauche vers l'axe" },
      // Transition défensive : revient au milieu, presse intelligemment
      transition_def: { x: 0.22, y: 0.52, role: "Pressing intelligent — cible le CB droit adverse" },
      // Défense placée : reste très haut, économise ses efforts
      defence_placee: { x: 0.18, y: 0.48, role: "Reste haut côté gauche — prêt au contre" },
      corner_off:     { x: 0.38, y: 0.82, role: "Appel pied droit — position de finisseur" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": {
        // Joue presque comme un attaquant — très peu de centres
        decrochage: +10,
        profondeur_off: +5,
        phase_attaque_x: 0.28, // encore plus dans l'axe
      },
      "3-4-3": {
        // Liberté totale — peut jouer à gauche, dans l'axe, derrière Jackson
        rentrer_axe: +10,
        largeur_off: +10,
        decrochage: +15,
      },
    },
    pointsForts: ["Finition ★★★★★", "Intelligence ★★★★★", "Technique ★★★★", "Leadership offensif"],
    pointsFaibles: ["Vitesse (a vieilli)", "Duels aériens"],
    traits: ["Cut Inside from Left", "Finisher", "Intelligent Movement", "Leader"],
    motivation_bonus: 0.15, // Dernière CdM
    stats: { pac: 84, tir: 88, pas: 82, dri: 90, def: 46, phy: 76 },
  },

  // ── REMPLAÇANTS CLÉS ───────────────────────────────────────────────────
  "ndiaye_13": {
    name: "I. Ndiaye", number: 13, position: "ATT", age: 25,
    club: "Everton", pied: "Droit",
    formNote: 8.2, injured: false, // Super-sub — buteur vs Irak
    ratingBase: 79,
    params: {
      largeur_off: 50,
      profondeur_off: 72,
      decrochage: 55,
      rentrer_axe: 60,
      pressing: 68,
      repli_def: 42,
      course_profondeur: 74,
      contre_vitesse: 80,
    },
    phases: {
      construction:   { x: 0.48, y: 0.48, role: "Très libre — cherche les espaces" },
      progression:    { x: 0.48, y: 0.58, role: "Joue entre les lignes" },
      attaque_placee: { x: 0.46, y: 0.68, role: "Créativité — dribble, passe ou frappe" },
      contre_attaque: { x: 0.48, y: 0.76, role: "Course profondeur axe" },
      transition_def: { x: 0.48, y: 0.50, role: "Pressing modéré" },
      defence_placee: { x: 0.46, y: 0.46, role: "Reste haut" },
    },
    formation_mods: {
      "4-3-3":   {},
      "4-2-3-1": { decrochage: +10, profondeur_off: +5 },
    },
    pointsForts: ["Créativité ★★★★★", "Dribbles ★★★★", "Entre les lignes ★★★★"],
    pointsFaibles: ["Impact physique", "Jeu aérien"],
    traits: ["Creative", "Dribbler", "Through Ball", "Unpredictable"],
    stats: { pac: 84, tir: 78, pas: 76, dri: 84, def: 38, phy: 68 },
  },
};

// ── Moteur de calcul de position ──────────────────────────────────────────
// Calcule la position (x,y) d'un joueur selon sa phase de jeu + formation

export function calcPlayerPosition(playerId, phase, formation = "4-3-3") {
  const p = PLAYER_PROFILES[playerId];
  if (!p) return null;

  // Position de base selon la phase
  const basePhase = p.phases?.[phase] ?? p.phases?.attaque_placee;
  if (!basePhase) return null;

  let x = basePhase.x;
  let y = basePhase.y;

  // Appliquer les modificateurs de formation
  const mods = p.formation_mods?.[formation];
  if (mods) {
    // Modificateurs de position directs
    if (mods.phase_attaque_x && phase === "attaque_placee") x = mods.phase_attaque_x;
    // Modificateurs de paramètres (influencent légèrement la position)
    if (mods.profondeur_off) y = Math.min(0.96, Math.max(0.04, y + mods.profondeur_off * 0.002));
    if (mods.largeur_off)    x = Math.min(0.96, Math.max(0.04, x + mods.largeur_off * 0.001));
    if (mods.rentrer_axe)    x = x + (0.5 - x) * (mods.rentrer_axe * 0.005);
  }

  return {
    x: Math.min(0.96, Math.max(0.04, x)),
    y: Math.min(0.96, Math.max(0.04, y)),
    role: basePhase.role,
  };
}

// Retourne la note live
export function getLiveRating(playerId) {
  const p = PLAYER_PROFILES[playerId];
  if (!p) return 7.0;
  return p.formNote ?? 7.0;
}

// Retourne le multiplicateur de forme
export function getFormMultiplier(playerId) {
  return Math.min(1.15, Math.max(0.85, 1.0 + (getLiveRating(playerId) - 7.0) * 0.10));
}

// Mapping phase tactique → phase de jeu joueur
export function tacticToPhase(tacticalState, possession) {
  if (possession !== "me") {
    // L'adversaire a le ballon
    if (tacticalState === "pressing_haut")   return "transition_def";
    if (tacticalState === "bloc_bas")        return "defence_placee";
    return "defence_placee";
  }
  // Sénégal a le ballon
  const map = {
    bloc_median:     "progression",
    pressing_haut:   "attaque_placee",
    attaque_placee:  "attaque_placee",
    contre_attaque:  "contre_attaque",
    bloc_bas:        "defence_placee",
    celebration:     "attaque_placee",
    defence:         "transition_def",
    possession_build:"construction",
  };
  return map[tacticalState] ?? "progression";
}

// Description du comportement actuel d'un joueur
export function getPlayerBehaviourDesc(playerId, phase, formation = "4-3-3") {
  const pos = calcPlayerPosition(playerId, phase, formation);
  return pos?.role ?? "";
}
