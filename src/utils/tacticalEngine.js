// src/utils/tacticalEngine.js

// Calcule le niveau en temps réel d'un joueur
export const getPlayerLiveRating = (player) => {
  let formModifier = 0;
  
  if (player.recentForm && player.recentForm.length > 0) {
    const formAverage = player.recentForm.reduce((a, b) => a + b, 0) / player.recentForm.length;
    // Pivot à 7.0 : si un joueur tourne à 7.5 de moyenne sur ses 5 derniers matchs, il prend un bonus
    formModifier = (formAverage - 7.0) * 2.5; 
  }

  // Pénalité si le joueur fatigue (condition < 100)
  const fatiguePenalty = (100 - player.condition) * 0.12;

  return Math.round((player.ratingBase + formModifier - fatiguePenalty) * 10) / 10;
};

// Calcule la puissance d'une ligne d'équipe (DEF, MIL, ATT)
export const getLinePower = (players, positionLine) => {
  const linePlayers = players.filter(p => p.position === positionLine);
  if (linePlayers.length === 0) return 0;

  const totalRating = linePlayers.reduce((sum, p) => sum + getPlayerLiveRating(p), 0);
  return Math.round((totalRating / linePlayers.length) * 10) / 10;
};