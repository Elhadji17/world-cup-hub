import React from 'react';
import { playersData } from '../data/players';
import PlayerCard from '../components/PlayerCard';

export default function Hub() {
  // On prépare les 12 joueurs en leur distribuant des raretés et des stats de test
  const previewCards = playersData.map((player, index) => {
    let rarity = "Commun";
    let bonus = 0;

    // Répartition automatique pour voir tous les styles de cartes
    if (index % 4 === 0) { rarity = "Légendaire"; bonus = 7; }
    else if (index % 4 === 1) { rarity = "Épique"; bonus = 4; }
    else if (index % 4 === 2) { rarity = "Rare"; bonus = 2; }

    return {
      ...player,
      rarity,
      rating: Math.min(player.rating + bonus, 99),
      final_att: Math.min(player.base_att + bonus, 99),
      final_def: Math.min(player.base_def + bonus, 99)
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      
      {/* BANDEAU TITRE */}
      <div className="max-w-6xl mx-auto border-b border-white/10 pb-6 mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-black tracking-wide uppercase">🃏 Album des Joueurs</h1>
        <p className="text-slate-400 text-sm">Aperçu visuel de tes 12 premières cartes de la Coupe du Monde.</p>
      </div>

      {/* GRILLE DES CARTES */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {previewCards.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>

    </div>
  );
}