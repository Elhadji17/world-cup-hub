// Prédictions IA simulées — inspiré du moteur all_leagues-prediction
// Ces données simulent ce que retournerait l'API Python/ML
// Quand le backend sera prêt, on remplacera par fetch("/api/ai-predictions/:matchId")

// Modèle : basé sur classement FIFA, historique face-à-face, forme récente
// Confiance calculée via Random Forest (simulé ici en JSON statique)

// IA Predictions — Coupe du Monde FIFA 2026
// Version complète avec reasoning (explications IA simulées RF)

export const AI_PREDICTIONS = {

  // ================= GROUP A =================
  1: {
    scoreA: 2, scoreB: 1, winner: "Mexique", confidence: 66, model: "RF",
    reasoning: "Mexique bénéficie de l'avantage du terrain et d'une meilleure intensité offensive."
  },
  2: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 52, model: "RF",
    reasoning: "Corée du Sud et Tchéquie ont un niveau similaire et privilégient la prudence."
  },
  3: {
    scoreA: 2, scoreB: 0, winner: "Mexique", confidence: 71, model: "RF",
    reasoning: "Mexique plus efficace dans les transitions rapides."
  },
  4: {
    scoreA: 1, scoreB: 0, winner: "Tchéquie", confidence: 55, model: "RF",
    reasoning: "Tchéquie plus disciplinée défensivement dans les matchs serrés."
  },
  5: {
    scoreA: 2, scoreB: 0, winner: "Mexique", confidence: 78, model: "RF",
    reasoning: "Mexique domine statistiquement le groupe sur la possession et les tirs."
  },
  6: {
    scoreA: 1, scoreB: 2, winner: "Corée du Sud", confidence: 60, model: "RF",
    reasoning: "Corée du Sud plus rapide en contre-attaque."
  },

  // ================= GROUP B =================
  7: {
    scoreA: 2, scoreB: 1, winner: "Suisse", confidence: 63, model: "RF",
    reasoning: "Suisse plus structurée tactiquement malgré la pression du Canada."
  },
  8: {
    scoreA: 2, scoreB: 1, winner: "Canada", confidence: 65, model: "RF",
    reasoning: "Canada profite de l'avantage domicile et de son intensité physique."
  },
  9: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
    reasoning: "Angleterre et USA se neutralisent dans un match stratégique."
  },
  10: {
    scoreA: 2, scoreB: 0, winner: "Suisse", confidence: 70, model: "RF",
    reasoning: "Suisse meilleure en organisation défensive et gestion du tempo."
  },
  11: {
    scoreA: 1, scoreB: 0, winner: "Canada", confidence: 58, model: "RF",
    reasoning: "Canada plus efficace dans les phases offensives rapides."
  },
  12: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 51, model: "RF",
    reasoning: "Match équilibré avec peu d'espaces entre les lignes."
  },

  // ================= GROUP C =================
  13: {
    scoreA: 3, scoreB: 0, winner: "Brésil", confidence: 88, model: "RF",
    reasoning: "Brésil largement supérieur techniquement et offensivement."
  },
  14: {
    scoreA: 2, scoreB: 1, winner: "Maroc", confidence: 62, model: "RF",
    reasoning: "Maroc plus discipliné et expérimenté en compétitions internationales."
  },
  15: {
    scoreA: 2, scoreB: 0, winner: "Brésil", confidence: 85, model: "RF",
    reasoning: "Brésil domine les duels individuels et collectifs."
  },
  16: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 48, model: "RF",
    reasoning: "Match équilibré avec peu de différence de niveau."
  },
  17: {
    scoreA: 3, scoreB: 1, winner: "Brésil", confidence: 90, model: "RF",
    reasoning: "Brésil impose un rythme trop élevé pour l'adversaire."
  },
  18: {
    scoreA: 2, scoreB: 0, winner: "Maroc", confidence: 60, model: "RF",
    reasoning: "Maroc plus solide défensivement et efficace sur coups de pied arrêtés."
  },

  // ================= GROUP D =================
  19: {
    scoreA: 2, scoreB: 1, winner: "USA", confidence: 64, model: "RF",
    reasoning: "USA profite du soutien du public et d'une bonne intensité physique."
  },
  20: {
    scoreA: 2, scoreB: 0, winner: "Turquie", confidence: 59, model: "RF",
    reasoning: "Turquie plus expérimentée dans les matchs à enjeu."
  },
  21: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 52, model: "RF",
    reasoning: "Match équilibré avec peu d'occasions franches."
  },
  22: {
    scoreA: 1, scoreB: 0, winner: "USA", confidence: 61, model: "RF",
    reasoning: "USA plus efficace dans la finition."
  },
  23: {
    scoreA: 2, scoreB: 1, winner: "USA", confidence: 67, model: "RF",
    reasoning: "USA domine les phases de transition rapide."
  },
  24: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
    reasoning: "Match serré sans domination claire."
  },

  // ================= GROUP E =================
  25: {
    scoreA: 2, scoreB: 0, winner: "Allemagne", confidence: 75, model: "RF",
    reasoning: "Allemagne contrôle le rythme et la possession."
  },
  26: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 53, model: "RF",
    reasoning: "Match tactiquement fermé entre deux équipes équilibrées."
  },
  27: {
    scoreA: 2, scoreB: 1, winner: "Allemagne", confidence: 70, model: "RF",
    reasoning: "Allemagne plus constante dans les phases clés."
  },
  28: {
    scoreA: 2, scoreB: 0, winner: "Côte d’Ivoire", confidence: 60, model: "RF",
    reasoning: "Côte d’Ivoire plus physique et efficace en duel."
  },
  29: {
    scoreA: 3, scoreB: 1, winner: "Allemagne", confidence: 82, model: "RF",
    reasoning: "Allemagne impose une supériorité technique nette."
  },
  30: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 49, model: "RF",
    reasoning: "Match ouvert sans domination claire."
  },

  // ================= GROUP F =================
  31: {
    scoreA: 2, scoreB: 1, winner: "Pays-Bas", confidence: 72, model: "RF",
    reasoning: "Pays-Bas plus efficace offensivement."
  },
  32: {
    scoreA: 1, scoreB: 0, winner: "Japon", confidence: 60, model: "RF",
    reasoning: "Japon discipliné et rapide en transition."
  },
  33: {
    scoreA: 2, scoreB: 0, winner: "Pays-Bas", confidence: 74, model: "RF",
    reasoning: "Pays-Bas domine la possession et les occasions."
  },
  34: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 52, model: "RF",
    reasoning: "Match équilibré et fermé."
  },
  35: {
    scoreA: 2, scoreB: 1, winner: "Pays-Bas", confidence: 78, model: "RF",
    reasoning: "Pays-Bas plus constant dans les matchs à enjeu."
  },
  36: {
    scoreA: 1, scoreB: 2, winner: "Japon", confidence: 58, model: "RF",
    reasoning: "Japon plus rapide et efficace en contre."
  },

  // ================= GROUP G =================
  37: {
    scoreA: 2, scoreB: 0, winner: "Belgique", confidence: 68, model: "RF",
    reasoning: "Belgique légèrement supérieure techniquement."
  },
  38: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 51, model: "RF",
    reasoning: "Match équilibré et tactique."
  },
  39: {
    scoreA: 2, scoreB: 1, winner: "Belgique", confidence: 70, model: "RF",
    reasoning: "Belgique plus efficace dans les moments clés."
  },
  40: {
    scoreA: 2, scoreB: 0, winner: "Égypte", confidence: 59, model: "RF",
    reasoning: "Égypte plus structurée défensivement."
  },
  41: {
    scoreA: 3, scoreB: 1, winner: "Belgique", confidence: 80, model: "RF",
    reasoning: "Belgique domine physiquement et techniquement."
  },
  42: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
    reasoning: "Match serré sans avantage clair."
  },

  // ================= GROUP H =================
  43: {
    scoreA: 2, scoreB: 1, winner: "Espagne", confidence: 76, model: "RF",
    reasoning: "Espagne domine la possession et la création."
  },
  44: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 52, model: "RF",
    reasoning: "Match fermé et tactique."
  },
  45: {
    scoreA: 2, scoreB: 0, winner: "Espagne", confidence: 74, model: "RF",
    reasoning: "Espagne plus technique et dominante."
  },
  46: {
    scoreA: 2, scoreB: 1, winner: "Uruguay", confidence: 60, model: "RF",
    reasoning: "Uruguay plus expérimenté dans les matchs serrés."
  },
  47: {
    scoreA: 3, scoreB: 0, winner: "Espagne", confidence: 82, model: "RF",
    reasoning: "Espagne écrase le jeu par sa possession."
  },
  48: {
    scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
    reasoning: "Match équilibré sans domination claire."
  },
  // ================= GROUP I =================
49: {
  scoreA: 2, scoreB: 1, winner: "France", confidence: 84, model: "RF",
  reasoning: "France possède une supériorité technique globale et une meilleure profondeur de banc."
},
50: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 52, model: "RF",
  reasoning: "Match équilibré entre Norvège et Irak avec peu d’écart de niveau."
},
51: {
  scoreA: 2, scoreB: 0, winner: "France", confidence: 86, model: "RF",
  reasoning: "France impose son rythme et contrôle totalement le milieu de terrain."
},
52: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 49, model: "RF",
  reasoning: "Sénégal solide défensivement, mais Norvège dangereuse en contre."
},
53: {
  scoreA: 3, scoreB: 0, winner: "France", confidence: 88, model: "RF",
  reasoning: "France domine le groupe grâce à sa puissance offensive."
},
54: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
  reasoning: "Match fermé avec peu d’espaces entre les deux équipes."
},

// ================= GROUP J =================
55: {
  scoreA: 2, scoreB: 0, winner: "Argentine", confidence: 85, model: "RF",
  reasoning: "Argentine supérieure techniquement et plus expérimentée."
},
56: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
  reasoning: "Algérie solide défensivement, capable de bloquer le jeu adverse."
},
57: {
  scoreA: 2, scoreB: 1, winner: "Argentine", confidence: 80, model: "RF",
  reasoning: "Argentine plus efficace dans les transitions offensives."
},
58: {
  scoreA: 1, scoreB: 0, winner: "Autriche", confidence: 56, model: "RF",
  reasoning: "Autriche disciplinée tactiquement et efficace sur phases arrêtées."
},
59: {
  scoreA: 3, scoreB: 1, winner: "Argentine", confidence: 88, model: "RF",
  reasoning: "Argentine domine grâce à sa créativité offensive."
},
60: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 49, model: "RF",
  reasoning: "Match équilibré entre équipes de niveau similaire."
},

// ================= GROUP K =================
61: {
  scoreA: 2, scoreB: 0, winner: "Portugal", confidence: 82, model: "RF",
  reasoning: "Portugal possède plus de qualité individuelle dans toutes les lignes."
},
62: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 52, model: "RF",
  reasoning: "Colombie solide mais irrégulière face à un adversaire discipliné."
},
63: {
  scoreA: 2, scoreB: 1, winner: "Portugal", confidence: 78, model: "RF",
  reasoning: "Portugal plus constant dans les moments clés du match."
},
64: {
  scoreA: 1, scoreB: 0, winner: "Colombie", confidence: 58, model: "RF",
  reasoning: "Colombie profite de son intensité et du jeu physique."
},
65: {
  scoreA: 3, scoreB: 1, winner: "Portugal", confidence: 86, model: "RF",
  reasoning: "Portugal impose un rythme trop élevé pour l’adversaire."
},
66: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
  reasoning: "Match serré avec peu d’occasions franches."
},

// ================= GROUP L =================
67: {
  scoreA: 2, scoreB: 1, winner: "Angleterre", confidence: 78, model: "RF",
  reasoning: "Angleterre plus structurée et plus forte offensivement."
},
68: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 51, model: "RF",
  reasoning: "Croatie très disciplinée, Ghana dangereux en contre."
},
69: {
  scoreA: 2, scoreB: 0, winner: "Angleterre", confidence: 80, model: "RF",
  reasoning: "Angleterre domine la possession et les duels."
},
70: {
  scoreA: 2, scoreB: 1, winner: "Ghana", confidence: 60, model: "RF",
  reasoning: "Ghana plus explosif offensivement et plus rapide."
},
71: {
  scoreA: 3, scoreB: 0, winner: "Angleterre", confidence: 84, model: "RF",
  reasoning: "Angleterre écrase le groupe par sa supériorité technique."
},
72: {
  scoreA: 1, scoreB: 1, winner: "Draw", confidence: 50, model: "RF",
  reasoning: "Match équilibré sans domination claire."
},
};


// Récupérer la prédiction IA pour un match donné
export function getAIPrediction(matchId) {
  return AI_PREDICTIONS[matchId] || null;
}

// Barre de confiance — retourne une couleur selon le niveau
export function getConfidenceColor(confidence) {
  if (confidence >= 75) return "text-green-400";
  if (confidence >= 55) return "text-yellow-400";
  return "text-orange-400";
}

export function getConfidenceBg(confidence) {
  if (confidence >= 75) return "bg-green-500";
  if (confidence >= 55) return "bg-yellow-500";
  return "bg-orange-500";
}