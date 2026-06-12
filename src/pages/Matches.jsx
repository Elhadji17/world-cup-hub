import React, { useState, useEffect } from "react";
import axios from "axios";

// Ta clé d'API active Football-Data.org
const API_KEY = "73f6590206524a81a5678ece33151513"; 
// Code de la Coupe du Monde (WC) sur Football-Data.org
const API_URL = "https://api.football-data.org/v4/competitions/WC/matches";

function Matches() {
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États de navigation pour la Coupe du Monde
  const [activeGroup, setActiveGroup] = useState("GROUP_A");
  const [activeMatchday, setActiveMatchday] = useState("1");

  // Liste des 12 groupes de la Coupe du Monde 2026 (De A à L)
  const groupsList = [
    { id: "GROUP_A", label: "Gr. A" }, { id: "GROUP_B", label: "Gr. B" },
    { id: "GROUP_C", label: "Gr. C" }, { id: "GROUP_D", label: "Gr. D" },
    { id: "GROUP_E", label: "Gr. E" }, { id: "GROUP_F", label: "Gr. F" },
    { id: "GROUP_G", label: "Gr. G" }, { id: "GROUP_H", label: "Gr. H" },
    { id: "GROUP_I", label: "Gr. I" }, { id: "GROUP_J", label: "Gr. J" },
    { id: "GROUP_K", label: "Gr. K" }, { id: "GROUP_L", label: "Gr. L" }
  ];

  // 1. Récupération des données avec le bon header (X-Auth-Token)
  useEffect(() => {
    const fetchWorldCupData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(API_URL, {
          headers: {
            "X-Auth-Token": API_KEY // CORRECTION : Format d'en-tête de Football-Data.org
          }
        });

        // Football-Data.org renvoie les matchs dans l'objet .matches
        if (response.data && response.data.matches) {
          // On ne garde que la phase de poules pour le moment
          const groupStageMatches = response.data.matches.filter(
            match => match.stage === "GROUP_STAGE"
          );
          setAllMatches(groupStageMatches);
        } else {
          throw new Error("Aucun match trouvé dans la réponse.");
        }
      } catch (err) {
        console.error("Erreur API Football-Data:", err.response);
        setError("Impossible de charger le calendrier de la Coupe du Monde.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorldCupData();
  }, []);

  // 2. FILTRAGE PAR GROUPE ET PAR JOURNÉE DE MATCH (MATCHDAY)
  const filteredMatches = allMatches.filter(match => {
    return match.group === activeGroup && String(match.matchday) === activeMatchday;
  });

  // 3. Convertir la date ISO UTC de l'API vers l'heure locale de l'ordinateur
  const formatToUserTime = (isoDateString) => {
    try {
      const matchDate = new Date(isoDateString);
      const dateFormatted = matchDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      const timeFormatted = matchDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return { date: dateFormatted, time: timeFormatted };
    } catch (e) {
      return { date: "Date inconnue", time: "--:--" };
    }
  };

  // 4. CALCUL DU CLASSEMENT GLOBAL DU GROUPE SÉLECTIONNÉ (Fixe sur les 3 journées)
  const computeStandings = () => {
    const standings = {};

    // On récupère TOUS les matchs du groupe actif (J1, J2, J3 combinés)
    const groupMatches = allMatches.filter(match => match.group === activeGroup);

    // Initialisation des 4 équipes du groupe
    groupMatches.forEach(item => {
      const tA = item.homeTeam?.name;
      const tB = item.awayTeam?.name;
      if (tA && !standings[tA]) standings[tA] = { team: tA, logo: item.homeTeam.crest, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      if (tB && !standings[tB]) standings[tB] = { team: tB, logo: item.awayTeam.crest, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });

    if (Object.keys(standings).length === 0) return [];

    // Calcul cumulé des scores des matchs finis
    groupMatches.forEach(item => {
      if (item.status === "FINISHED") {
        const tA = item.homeTeam.name;
        const tB = item.awayTeam.name;
        const sA = item.score.fullTime.home ?? 0;
        const sB = item.score.fullTime.away ?? 0;

        if (standings[tA] && standings[tB]) {
          standings[tA].mp += 1; standings[tB].mp += 1;
          standings[tA].gf += sA; standings[tA].ga += sB;
          standings[tB].gf += sB; standings[tB].ga += sA;

          if (sA > sB) {
            standings[tA].w += 1; standings[tA].pts += 3;
            standings[tB].l += 1;
          } else if (sA < sB) {
            standings[tB].w += 1; standings[tB].pts += 3;
            standings[tA].l += 1;
          } else {
            standings[tA].d += 1; standings[tA].pts += 1;
            standings[tB].d += 1; standings[tB].pts += 1;
          }
        }
      }
    });

    // Tri (Points -> Différence de buts -> Buts marqués)
    return Object.values(standings).map(t => {
      t.gd = t.gf - t.ga;
      return t;
    }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  };

  const standingsData = computeStandings();

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">⏳ Chargement de l'API Coupe du Monde...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex justify-center items-center text-xl">⚠️ {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      
      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-2 text-center tracking-tight text-amber-400">
        🏆 FIFA World Cup 2026
      </h1>
      <p className="text-center text-gray-400 mb-8">Données globales en temps réel • Football-Data.org</p>

      {/* BARRE HORIZONTALE DES GROUPES (A à L) */}
      <div className="max-w-5xl mx-auto mb-4">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none snap-x">
          {groupsList.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setActiveGroup(g.id);
                // Optionnel : Réinitialiser à la journée 1 quand on change de groupe
                setActiveMatchday("1");
              }}
              className={`snap-center px-5 py-3 rounded-xl font-bold text-base transition-all min-w-[85px] flex-shrink-0 ${
                activeGroup === g.id
                  ? "bg-amber-500 text-gray-950 shadow-lg font-black scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* SOUS-SELECTION : LES 3 MATCHDAYS */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-center gap-4 border-t border-b border-gray-800 py-3">
        {["1", "2", "3"].map((day) => (
          <button
            key={day}
            onClick={() => setActiveMatchday(day)}
            className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all ${
              activeMatchday === day 
                ? "bg-blue-600 text-white shadow" 
                : "text-gray-400 hover:text-white bg-gray-800/40"
            }`}
          >
            Journée {day}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TABLEAU DE CLASSEMENT GENERAL DU GROUPE SELECTIONNÉ */}
        <div className="lg:col-span-5 bg-gray-800 rounded-2xl p-4 md:p-5 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
            📊 Situation du {groupsList.find(g => g.id === activeGroup)?.label}
          </h2>
          
          {standingsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700 text-xs uppercase">
                    <th className="py-3 px-1 text-center w-8">#</th>
                    <th className="py-3 px-2">Équipe</th>
                    <th className="py-3 px-1 text-center">MJ</th>
                    <th className="py-3 px-1 text-center">Diff</th>
                    <th className="py-3 px-2 text-center font-bold text-white">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standingsData.map((row, index) => (
                    <tr key={row.team} className={`border-b border-gray-700/50 last:border-0 ${index < 2 ? "bg-emerald-950/20" : ""}`}>
                      <td className="py-3 px-1 text-center text-gray-400 font-bold">{index + 1}</td>
                      <td className="py-3 px-2 font-semibold flex items-center gap-2 max-w-[150px] truncate">
                        <img src={row.logo} alt={row.team} className="w-6 h-4 object-cover rounded-sm bg-gray-900 shadow-sm" />
                        <span className="truncate">{row.team}</span>
                      </td>
                      <td className="py-3 px-1 text-center">{row.mp}</td>
                      <td className={`py-3 px-1 text-center font-bold text-xs ${row.gd > 0 ? "text-green-400" : row.gd < 0 ? "text-red-400" : "text-gray-400"}`}>
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-amber-400 text-base">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4 text-sm">Aucune donnée disponible pour le classement.</p>
          )}
        </div>

        {/* LISTE DES MATCHS DE LA JOURNÉE DANS CE GROUPE */}
        <div className="lg:col-span-7 grid gap-4">
          <h2 className="text-xl font-bold mb-1 text-gray-300">
            🗓️ Matchs (Journée {activeMatchday})
          </h2>
          
          {filteredMatches.length > 0 ? (
            filteredMatches.map((item) => {
              const timeInfo = formatToUserTime(item.utcDate); // L'API utilise utcDate
              const isFinished = item.status === "FINISHED";
              const isLive = item.status === "IN_PLAY" || item.status === "PAUSED";

              return (
                <div key={item.id} className="bg-gray-800 p-5 rounded-2xl border border-gray-700/70 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-gray-500 font-mono">ID: #{item.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isLive ? "bg-red-600 text-white animate-pulse" : isFinished ? "bg-gray-700 text-gray-400" : "bg-blue-950 text-blue-400"
                    }`}>
                      {isLive ? "En direct" : isFinished ? "Terminé" : "À venir"}
                    </span>
                  </div>

                  {/* BLOC ÉQUIPES ET SCORES */}
                  <div className="flex items-center justify-between my-2 max-w-md mx-auto">
                    {/* Home */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-5/12 text-center sm:text-left">
                      <img src={item.homeTeam.crest} alt={item.homeTeam.name} className="w-7 h-5 object-cover rounded-sm bg-gray-900 shadow-sm" />
                      <span className="font-bold text-sm truncate w-full">{item.homeTeam.name}</span>
                    </div>

                    {/* Score central */}
                    <div className="w-2/12 flex justify-center">
                      {isFinished || isLive ? (
                        <div className="bg-gray-900 px-3 py-1 rounded-lg font-mono font-bold text-base border border-gray-700 flex gap-2">
                          <span>{item.score.fullTime.home}</span>
                          <span className="text-gray-600">-</span>
                          <span>{item.score.fullTime.away}</span>
                        </div>
                      ) : (
                        <span className="text-xs bg-gray-900 text-gray-500 px-2.5 py-1 rounded border border-gray-700">VS</span>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col sm:flex-row-reverse items-center gap-2 w-5/12 text-center sm:text-right">
                      <img src={item.awayTeam.crest} alt={item.awayTeam.name} className="w-7 h-5 object-cover rounded-sm bg-gray-900 shadow-sm" />
                      <span className="font-bold text-sm truncate w-full">{item.awayTeam.name}</span>
                    </div>
                  </div>

                  {/* CHRONO ET HORAIRES ADAPTÉS AU VISITEUR */}
                  <div className="flex justify-between text-[11px] text-gray-400 border-t border-gray-700/40 pt-3 mt-4">
                    <span>📅 {timeInfo.date}</span>
                    <span className="text-blue-400 font-semibold">⏰ {timeInfo.time} (Votre heure)</span>
                    <span className="truncate max-w-[150px]">🏟️ {item.venue || "Stade Mondial"}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 italic text-center py-10">
              Aucun match trouvé pour cette configuration.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Matches;