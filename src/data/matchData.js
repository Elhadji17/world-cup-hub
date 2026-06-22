// src/data/matchData.js

export const INITIAL_SENEGAL = {
  formation: "4-3-3",
  titulars: [
    { id: "mendy_16", name: "É. Mendy", position: "GK", number: 16, ratingBase: 81, condition: 100, recentForm: [6.5, 7.0, 6.8, 7.2, 5.8] }, // Match difficile vs France
    
    { id: "koulibaly_3", name: "K. Koulibaly", position: "DEF", number: 3, ratingBase: 82, condition: 100, recentForm: [7.5, 7.8, 7.2, 8.0, 6.2] },
    { id: "niakhate_19", name: "M. Niakhaté", position: "DEF", number: 19, ratingBase: 79, condition: 100, recentForm: [7.0, 7.2, 7.5, 6.8, 6.0] },
    { id: "diouf_25", name: "E. Diouf", position: "DEF", number: 25, ratingBase: 76, condition: 100, recentForm: [7.1, 7.3, 7.0, 7.5, 6.5] },
    { id: "diatta_15", name: "K. Diatta", position: "DEF", number: 15, ratingBase: 77, condition: 100, recentForm: [6.8, 7.0, 7.2, 6.9, 6.7] }, // Repositionné latéral droit
    
    { id: "gueye_5", name: "I. Gueye", position: "MIL", number: 5, ratingBase: 76, condition: 100, recentForm: [6.5, 6.9, 6.8, 7.1, 6.3] },
    { id: "camara_8", name: "L. Camara", position: "MIL", number: 8, ratingBase: 80, condition: 100, recentForm: [8.2, 7.9, 8.5, 8.0, 7.1] }, // La jeune plaque tournante
    { id: "gueye_26", name: "P. Gueye", position: "MIL", number: 26, ratingBase: 77, condition: 100, recentForm: [7.0, 7.2, 7.1, 7.4, 6.6] },
    
    { id: "mane_10", name: "S. Mané", position: "ATT", number: 10, ratingBase: 83, condition: 100, recentForm: [7.5, 8.0, 7.2, 8.4, 6.9] },
    { id: "jackson_11", name: "N. Jackson", position: "ATT", number: 11, ratingBase: 81, condition: 100, recentForm: [7.2, 7.5, 6.8, 7.8, 6.4] },
    { id: "sarr_18", name: "I. Sarr", position: "ATT", number: 18, ratingBase: 78, condition: 100, recentForm: [7.0, 6.8, 7.4, 7.1, 6.5] }
  ],
  bench: [
    { id: "ndiaye_13", name: "I. Ndiaye", position: "ATT", number: 13, ratingBase: 77, condition: 100, recentForm: [7.0, 7.2, 6.9, 7.3, 7.0] },
    { id: "mbaye_20", name: "I. Mbaye", position: "ATT", number: 20, ratingBase: 74, condition: 100, recentForm: [6.8, 7.0, 7.2, 6.5, 7.5] }, // Le jeune crack du PSG
    { id: "sarr_17", name: "P. M. Sarr", position: "MIL", number: 17, ratingBase: 78, condition: 100, recentForm: [7.2, 7.0, 7.1, 7.3, 6.8] },
    { id: "diarra_21", name: "H. Diarra", position: "MIL", number: 21, ratingBase: 76, condition: 100, recentForm: [7.0, 7.1, 6.8, 6.9, 7.2] },
    { id: "jakobs_14", name: "I. Jakobs", position: "DEF", number: 14, ratingBase: 76, condition: 100, recentForm: [6.9, 6.8, 7.0, 7.1, 6.5] },
    { id: "sarr_2", name: "M. Sarr", position: "DEF", number: 2, ratingBase: 74, condition: 100, recentForm: [6.5, 6.7, 6.4, 6.8, 6.6] }
  ]
};

export const NORWAY_TEAM = {
  formation: "4-3-3",
  titulars: [
    { id: "nyland_1", name: "Ø. Nyland", position: "GK", number: 1, ratingBase: 76, condition: 100 },
    { id: "ostigard_4", name: "L. Østigård", position: "DEF", number: 4, ratingBase: 78, condition: 100 },
    { id: "hanche_3", name: "A. Hanche-Olsen", position: "DEF", number: 3, ratingBase: 76, condition: 100 },
    { id: "ryerson_14", name: "J. Ryerson", position: "DEF", number: 14, ratingBase: 80, condition: 100 },
    { id: "wolfe_2", name: "D. Wolfe", position: "DEF", number: 2, ratingBase: 74, condition: 100 },
    
    { id: "berge_8", name: "S. Berge", position: "MIL", number: 8, ratingBase: 79, condition: 100 },
    { id: "odegaard_10", name: "M. Ødegaard", position: "MIL", number: 10, ratingBase: 87, condition: 100 }, // En confiance
    { id: "thorstvedt_16", name: "K. Thorstvedt", position: "MIL", number: 16, ratingBase: 76, condition: 100 },
    
    { id: "haaland_9", name: "E. Haaland", position: "ATT", number: 9, ratingBase: 92, condition: 100 }, // Le danger absolu
    { id: "sorloth_11", name: "A. Sørloth", position: "ATT", number: 11, ratingBase: 81, condition: 100 },
    { id: "nusa_7", name: "A. Nusa", position: "ATT", number: 7, ratingBase: 78, condition: 100 }
  ]
};