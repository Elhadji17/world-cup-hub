import React, { useState } from "react";
// Importation des données réelles, des groupes et des drapeaux
import { GROUPS, MATCHES, FLAGS } from "../data/matches"; 

function Matches() {
  // État pour le groupe actuellement sélectionné (Groupe A par défaut)
  const [activeGroup, setActiveGroup] = useState("A");

  const groupLetters = Object.keys(GROUPS);

  // 1. Filtrer les matchs pour le groupe actif
  const filteredMatches = MATCHES.filter(match => match.group === activeGroup);

  // 2. FONCTION DE CALCUL DU CLASSEMENT DU GROUPE ACTIF
  const computeStanding = () => {
    const teamsInGroup = GROUPS[activeGroup] || [];
    
    // Initialisation des stats pour chaque équipe du groupe
    const standings = teamsInGroup.reduce((acc, team) => {
      acc[team] = { team, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      return acc;
    }, {});

    // Parcours de tous les matchs pour calculer les points si les scores existent
    MATCHES.forEach(match => {
      if (match.group !== activeGroup) return;
      
      // On vérifie si le match a été joué (si les scores sont définis numériquement)
      const hasScore = match.scoreA !== undefined && match.scoreB !== undefined;
      
      if (hasScore && standings[match.teamA] && standings[match.teamB]) {
        const sA = Number(match.scoreA);
        const sB = Number(match.scoreB);

        // Mise à jour des Matchs Joués (MP) et Buts Pour/Contre (GF/GA)
        standings[match.teamA].mp += 1;
        standings[match.teamB].mp += 1;
        standings[match.teamA].gf += sA;
        standings[match.teamA].ga += sB;
        standings[match.teamB].gf += sB;
        standings[match.teamB].ga += sA;

        // Calcul Victoire / Nul / Défaite et attribution des Points
        if (sA > sB) {
          standings[match.teamA].w += 1;
          standings[match.teamA].pts += 3;
          standings[match.teamB].l += 1;
        } else if (sA < sB) {
          standings[match.teamB].w += 1;
          standings[match.teamB].pts += 3;
          standings[match.teamA].l += 1;
        } else {
          standings[match.teamA].d += 1;
          standings[match.teamA].pts += 1;
          standings[match.teamB].d += 1;
          standings[match.teamB].pts += 1;
        }
      }
    });

    // Conversion en tableau et calcul de la différence de buts (GD)
    return Object.values(standings).map(t => {
      t.gd = t.gf - t.ga;
      return t;
    }).sort((a, b) => {
      // Tri par : 1. Points, 2. Différence de buts, 3. Buts marqués
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  };

  const standingsData = computeStanding();

  // Formater les dates
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-2 text-center tracking-tight">
        📅 Match Center - FIFA World Cup 2026
      </h1>
      <p className="text-center text-gray-400 mb-8">Matchs et classements en temps réel</p>

      {/* BARRE HORIZONTALE DES BOUTONS */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent snap-x">
          {groupLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => setActiveGroup(letter)}
              className={`snap-center px-5 py-3 rounded-xl font-bold text-base transition-all min-w-[75px] flex-shrink-0 ${
                activeGroup === letter
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Gr. {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLONNE GAUCHE : LE TABLEAU DE CLASSEMENT */}
        <div className="lg:col-span-5 bg-gray-800 rounded-2xl p-4 md:p-5 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            📊 Classement Groupe {activeGroup}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700 text-xs uppercase tracking-wider">
                  <th className="py-3 px-2 text-center w-8">#</th>
                  <th className="py-3 px-2">Équipe</th>
                  <th className="py-3 px-2 text-center">MJ</th>
                  <th className="py-3 px-1 text-center hidden sm:table-cell">V</th>
                  <th className="py-3 px-1 text-center hidden sm:table-cell">N</th>
                  <th className="py-3 px-1 text-center hidden sm:table-cell">D</th>
                  <th className="py-3 px-2 text-center">Diff</th>
                  <th className="py-3 px-2 text-center font-bold text-white">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standingsData.map((row, index) => (
                  <tr 
                    key={row.team} 
                    className={`border-b border-gray-700/50 last:border-0 hover:bg-gray-750 transition-colors ${
                      index < 2 ? "bg-blue-950/20" : "" // Surligner les 2 premiers qualifiés
                    }`}
                  >
                    <td className="py-3 px-2 text-center font-mono text-gray-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-3 px-2 font-semibold flex items-center gap-2 truncate max-w-[140px] sm:max-w-none">
                      <span>{FLAGS[row.team] || "🏳️"}</span>
                      <span className="truncate">{row.team}</span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono">{row.mp}</td>
                    <td className="py-3 px-1 text-center font-mono text-gray-400 hidden sm:table-cell">{row.w}</td>
                    <td className="py-3 px-1 text-center font-mono text-gray-400 hidden sm:table-cell">{row.d}</td>
                    <td className="py-3 px-1 text-center font-mono text-gray-400 hidden sm:table-cell">{row.l}</td>
                    <td className={`py-3 px-2 text-center font-mono text-xs font-bold ${
                      row.gd > 0 ? "text-green-400" : row.gd < 0 ? "text-red-400" : "text-gray-400"
                    }`}>
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-base text-blue-400">
                      {row.pts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[11px] text-gray-500 italic">
            * Les deux premières équipes de chaque groupe accèdent aux 16es de finale.
          </div>
        </div>

        {/* COLONNE DROITE : LES MATCHS DU GROUPE */}
        <div className="lg:col-span-7 grid gap-4">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-gray-300">
            🗓️ Rencontres du groupe
          </h2>
          
          {filteredMatches.map((match) => {
            const isPlayed = match.scoreA !== undefined && match.scoreB !== undefined;
            return (
              <div
                key={match.id}
                className="bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-700/70 hover:border-blue-500/50 transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Match #{match.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isPlayed 
                      ? "bg-gray-700 text-gray-300" 
                      : "bg-blue-950 text-blue-400 border border-blue-900"
                  }`}>
                    {isPlayed ? "Terminé" : "À venir"}
                  </span>
                </div>

                {/* LOGIQUE D'AFFICHAGE DES ÉQUIPES ET SCORES */}
                <div className="flex items-center justify-between my-2 max-w-md mx-auto">
                  {/* Équipe A */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-5/12 text-center sm:text-left">
                    <span className="text-2xl sm:text-xl">{FLAGS[match.teamA] || "🏳️"}</span>
                    <span className="font-bold text-sm sm:text-base truncate w-full" title={match.teamA}>{match.teamA}</span>
                  </div>

                  {/* Score Central ou "VS" */}
                  <div className="w-2/12 flex justify-center">
                    {isPlayed ? (
                      <div className="bg-gray-900 px-3 py-1 rounded-lg font-mono font-bold text-base border border-gray-700 flex gap-2">
                        <span>{match.scoreA}</span>
                        <span className="text-gray-600">-</span>
                        <span>{match.scoreB}</span>
                      </div>
                    ) : (
                      <span className="text-xs uppercase bg-gray-900 text-gray-500 px-2.5 py-1 rounded-md font-semibold border border-gray-700/50">VS</span>
                    )}
                  </div>

                  {/* Équipe B */}
                  <div className="flex flex-col sm:flex-row-reverse items-center gap-2 w-5/12 text-center sm:text-right">
                    <span className="text-2xl sm:text-xl">{FLAGS[match.teamB] || "🏳️"}</span>
                    <span className="font-bold text-sm sm:text-base truncate w-full" title={match.teamB}>{match.teamB}</span>
                  </div>
                </div>

                {/* INFOS DU MATCH */}
                <div className="flex justify-between text-[11px] text-gray-400 border-t border-gray-700/40 pt-3 mt-4 px-1">
                  <span>📅 {formatDate(match.date)}</span>
                  <span>⏰ {match.time} (locale)</span>
                  <span className="truncate max-w-[150px]" title={match.stadium}>🏟️ {match.stadium}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

export default Matches;