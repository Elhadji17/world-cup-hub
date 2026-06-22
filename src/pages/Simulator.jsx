// src/pages/Simulator.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useGameStats } from "../hooks/useGameStats.jsx";
import { TACTICS, generateHalfEvents, mergeMatchStats, calcTeamStats, applyTactic } from "../data/match-engine";
import { KEY_ACTIONS } from "../data/match-engine";

// ==========================================
// 📐 CONFIGURATION GÉOMÉTRIE DU TERRAIN
// ==========================================
function getInitialPosition(position, index, totalInPosition, isAway = false) {
  let x = 50;
  let y = 50;
  const hSpacing = 100 / (totalInPosition + 1);
  x = hSpacing * (index + 1);

  switch (position) {
    case "GK":  y = 5;   break;
    case "DEF": y = 24;  break;
    case "MIL": y = 48;  break;
    case "ATT": y = 74;  break;
    default:    y = 50;
  }

  if (isAway) {
    y = 100 - y;
  }
  return { x, y };
}

// ==========================================
// ⚽ COMPOSANT TERRAIN VISUEL (22 JOUEURS)
// ==========================================
function TacticalPitch({ homePlayers, awayPlayers, currentEvent }) {
  let zone = "midfield";
  let ballSide = "midfield";

  if (currentEvent) {
    if (currentEvent.type === "goal" || currentEvent.type === "shoot" || currentEvent.type === "danger") {
      zone = currentEvent.team === "me" ? "attack" : "defense";
      ballSide = currentEvent.team === "me" ? "top" : "bottom";
    }
  }

  const homeYModifier = zone === "attack" ? 12 : zone === "defense" ? -10 : 0;
  const awayYModifier = zone === "attack" ? 10 : zone === "defense" ? -12 : 0;

  const getPositionCounts = (players) => {
    const counts = { GK: 0, DEF: 0, MIL: 0, ATT: 0 };
    players.forEach(p => counts[p.position] = (counts[p.position] || 0) + 1);
    return counts;
  };

  const homeCounts = getPositionCounts(homePlayers);
  const awayCounts = getPositionCounts(awayPlayers);

  const homeIndices = { GK: 0, DEF: 0, MIL: 0, ATT: 0 };
  const awayIndices = { GK: 0, DEF: 0, MIL: 0, ATT: 0 };

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-emerald-900 to-green-800 rounded-2xl border-4 border-white/10 overflow-hidden shadow-2xl mb-4">
      {/* Marquages au sol */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 w-48 h-16 border-2 border-t-0 border-white -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-16 border-2 border-b-0 border-white -translate-x-1/2" />
      </div>

      {/* ÉQUIPE DOMICILE (Sénégal - Vert) */}
      {homePlayers.map((player) => {
        const posIndex = homeIndices[player.position]++;
        const totalInPos = homeCounts[player.position];
        const basePos = getInitialPosition(player.position, posIndex, totalInPos, false);
        const isGK = player.position === "GK";
        const animatedY = isGK ? basePos.y : basePos.y + homeYModifier;

        return (
          <motion.div
            key={`home-${player.id}`}
            className="absolute w-4 h-4 md:w-5 md:h-5 bg-emerald-500 border border-white rounded-full flex items-center justify-center shadow-md z-10"
            style={{ left: `${basePos.x}%`, bottom: `${animatedY}%` }}
            animate={{ x: "-50%", y: "50%" }}
            transition={{ type: "spring", stiffness: 40, damping: 12 }}
          >
            <span className="text-[7px] md:text-[8px] font-black text-white">{player.name.substring(0, 2).toUpperCase()}</span>
          </motion.div>
        );
      })}

      {/* ÉQUIPE EXTÉRIEURE (Norvège - Rouge) */}
      {awayPlayers.map((player) => {
        const posIndex = awayIndices[player.position]++;
        const totalInPos = awayCounts[player.position];
        const basePos = getInitialPosition(player.position, posIndex, totalInPos, true);
        const isGK = player.position === "GK";
        const animatedY = isGK ? basePos.y : basePos.y + awayYModifier;

        return (
          <motion.div
            key={`away-${player.id}`}
            className="absolute w-4 h-4 md:w-5 md:h-5 bg-red-600 border border-white rounded-full flex items-center justify-center shadow-md z-10"
            style={{ left: `${basePos.x}%`, top: `${animatedY}%` }}
            animate={{ x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 40, damping: 12 }}
          >
            <span className="text-[7px] md:text-[8px] font-black text-white">{player.name.substring(0, 2).toUpperCase()}</span>
          </motion.div>
        );
      })}

      {/* LE BALLON */}
      <motion.div
        className="absolute w-2.5 h-2.5 bg-white border border-black rounded-full shadow-lg z-20"
        animate={{
          left: ballSide === "top" ? "50%" : ballSide === "bottom" ? "50%" : "49%",
          top: ballSide === "top" ? "20%" : ballSide === "bottom" ? "80%" : "50%"
        }}
        transition={{ type: "spring", stiffness: 60, damping: 10 }}
      />
    </div>
  );
}

// ==========================================
// 🛠️ COMPOSANT PANNEAU DE MANAGEMENT TACTIQUE
// ==========================================
function TeamManagement({ titulars, bench, selectedMatch, onSubstitute }) {
  const [selectedTitular, setSelectedTitular] = useState(null);

  // Fonction utilitaire pour calculer l'impact de la forme récente sur la note
  const getLiveRating = (player) => {
    if (!player.recentForm) return player.rating;
    const formAverage = player.recentForm.reduce((a, b) => a + b, 0) / player.recentForm.length;
    const modifier = (formAverage - 7.0) * 2;
    return Math.round(player.rating + modifier);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-5 shadow-xl">
      <div className="border-b border-white/5 pb-3 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-green-400">📋 Gestion d'Équipe du Sénégal</h4>
        <p className="text-[11px] text-gray-400 mt-0.5">Cliquez sur un titulaire pour voir sa forme récente ou le remplacer.</p>
      </div>

      {/* Liste des titulaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {titulars.map((player) => {
          const liveRating = getLiveRating(player);
          const isSelected = selectedTitular?.id === player.id;
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => setSelectedTitular(isSelected ? null : player)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                isSelected ? "bg-green-500/10 border-green-400 shadow-md" : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono w-7 text-center shrink-0">{player.position}</span>
                <span className="text-xs font-bold text-white truncate">{player.name}</span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className={`text-xs font-bold ${liveRating > player.rating ? 'text-green-400' : liveRating < player.rating ? 'text-amber-400' : 'text-gray-300'}`}>
                  {liveRating}
                </span>
                <span className="text-[9px] text-gray-500 block">Forme Live</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Menu d'affichage du banc si un titulaire est cliqué */}
      {selectedTitular && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-3 rounded-xl border border-green-500/20">
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase">5 derniers matchs : </span>
              <span className="text-[10px] font-mono text-gray-300">[{selectedTitular.recentForm.join(" - ")}]</span>
            </div>
            <button onClick={() => setSelectedTitular(null)} className="text-[10px] text-gray-400 hover:text-white underline">Fermer</button>
          </div>
          
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">🔄 Remplacer par un joueur du banc :</h5>
          <div className="grid grid-cols-2 gap-2">
            {bench.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  onSubstitute(selectedTitular.id, sub);
                  setSelectedTitular(null);
                }}
                className="flex items-center justify-between p-2 bg-black/40 border border-white/5 hover:border-green-500/40 rounded-lg text-left transition-all"
              >
                <span className="text-xs text-gray-300 truncate">{sub.name}</span>
                <span className="text-[10px] font-mono text-gray-500 font-bold bg-white/5 px-1 rounded">{sub.position}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ==========================================
// 🚀 INJECTION COMPOSANT DE SIMULATION PRINCIPAL
// ==========================================
const REAL_MATCHES = [
  {
    id: "sen_nor_2026",
    homeTeam: "🇸🇳 Sénégal",
    awayTeam: "🇳🇴 Norvège",
    group: "Groupe I · 2e journée",
    stadium: "MetLife Stadium, New Jersey",
    date: "22 juin 2026",
    userSide: "home",
    home: {
      name: "Sénégal",
      flag: "🇸🇳",
      formation: "4-2-3-1",
      rating: 81,
      players: [
        { id: "sn_gk",  name: "E. Mendy",    position: "GK",  rating: 86, recentForm: [6.5, 7.0, 6.8, 7.2, 5.8], stats: { PAC: 58, TIR: 18, PAS: 62, DRI: 42, DEF: 88, PHY: 84 } },
        { id: "sn_rb",  name: "M. Diouf",    position: "DEF", rating: 78, recentForm: [7.1, 7.3, 7.0, 7.5, 6.5], stats: { PAC: 82, TIR: 45, PAS: 68, DRI: 70, DEF: 74, PHY: 76 } },
        { id: "sn_cb1", name: "Koulibaly",   position: "DEF", rating: 85, recentForm: [7.5, 7.8, 7.2, 8.0, 6.2], stats: { PAC: 72, TIR: 38, PAS: 68, DRI: 62, DEF: 88, PHY: 90 } },
        { id: "sn_cb2", name: "Niakhate",    position: "DEF", rating: 79, recentForm: [7.0, 7.2, 7.5, 6.8, 6.0], stats: { PAC: 70, TIR: 35, PAS: 64, DRI: 58, DEF: 82, PHY: 84 } },
        { id: "sn_lb",  name: "K. Diatta",   position: "DEF", rating: 77, recentForm: [6.8, 7.0, 7.2, 6.9, 6.7], stats: { PAC: 84, TIR: 48, PAS: 70, DRI: 72, DEF: 70, PHY: 72 } },
        { id: "sn_dm1", name: "I. Gueye",    position: "MIL", rating: 80, recentForm: [6.5, 6.9, 6.8, 7.1, 6.3], stats: { PAC: 72, TIR: 58, PAS: 78, DRI: 72, DEF: 80, PHY: 82 } },
        { id: "sn_dm2", name: "P. Gueye",    position: "MIL", rating: 76, recentForm: [7.0, 7.2, 7.1, 7.4, 6.6], stats: { PAC: 74, TIR: 55, PAS: 74, DRI: 68, DEF: 72, PHY: 78 } },
        { id: "sn_am1", name: "Sadio Mané",  position: "ATT", rating: 87, recentForm: [7.5, 8.0, 7.2, 8.4, 6.9], stats: { PAC: 92, TIR: 84, PAS: 80, DRI: 88, DEF: 44, PHY: 80 } },
        { id: "sn_am2", name: "L. Camara",   position: "ATT", rating: 78, recentForm: [8.2, 7.9, 8.5, 8.0, 7.1], stats: { PAC: 82, TIR: 72, PAS: 76, DRI: 80, DEF: 38, PHY: 74 } },
        { id: "sn_am3", name: "I. Sarr",     position: "ATT", rating: 82, recentForm: [7.0, 6.8, 7.4, 7.1, 6.5], stats: { PAC: 90, TIR: 78, PAS: 72, DRI: 84, DEF: 35, PHY: 72 } },
        { id: "sn_st",  name: "N. Jackson",  position: "ATT", rating: 80, recentForm: [7.2, 7.5, 6.8, 7.8, 6.4], stats: { PAC: 82, TIR: 80, PAS: 62, DRI: 76, DEF: 30, PHY: 82 } },
      ],
      bench: [
        { id: "sn_sub1", name: "I. Ndiaye",  position: "ATT", rating: 77, recentForm: [7.0, 7.2, 6.9, 7.3, 7.0], stats: { PAC: 80, TIR: 74, PAS: 72, DRI: 82, DEF: 36, PHY: 70 } },
        { id: "sn_sub2", name: "I. Mbaye",   position: "ATT", rating: 74, recentForm: [6.8, 7.0, 7.2, 6.5, 7.5], stats: { PAC: 88, TIR: 70, PAS: 68, DRI: 78, DEF: 32, PHY: 66 } },
        { id: "sn_sub3", name: "P. M. Sarr", position: "MIL", rating: 78, recentForm: [7.2, 7.0, 7.1, 7.3, 6.8], stats: { PAC: 78, TIR: 70, PAS: 76, DRI: 75, DEF: 74, PHY: 76 } },
        { id: "sn_sub4", name: "I. Jakobs",  position: "DEF", rating: 76, recentForm: [6.9, 6.8, 7.0, 7.1, 6.5], stats: { PAC: 84, TIR: 42, PAS: 68, DRI: 70, DEF: 72, PHY: 74 } }
      ]
    },
    away: {
      name: "Norvège",
      flag: "🇳🇴",
      formation: "4-3-3",
      rating: 84,
      tactic: TACTICS[2],
      players: [
        { id: "nor_gk",  name: "Ø. Nyland",  position: "GK",  rating: 80, stats: { PAC: 55, TIR: 15, PAS: 58, DRI: 38, DEF: 82, PHY: 80 } },
        { id: "nor_rb",  name: "Ryerson",     position: "DEF", rating: 80, stats: { PAC: 80, TIR: 42, PAS: 68, DRI: 66, DEF: 76, PHY: 78 } },
        { id: "nor_cb1", name: "K. Ajer",      position: "DEF", rating: 80, stats: { PAC: 72, TIR: 35, PAS: 68, DRI: 60, DEF: 84, PHY: 86 } },
        { id: "nor_cb2", name: "Heggem",       position: "DEF", rating: 76, stats: { PAC: 68, TIR: 30, PAS: 62, DRI: 55, DEF: 80, PHY: 84 } },
        { id: "nor_lb",  name: "D. Wolfe",     position: "DEF", rating: 76, stats: { PAC: 78, TIR: 40, PAS: 65, DRI: 64, DEF: 72, PHY: 74 } },
        { id: "nor_cm1", name: "S. Berge",     position: "MIL", rating: 82, stats: { PAC: 74, TIR: 65, PAS: 82, DRI: 76, DEF: 72, PHY: 88 } },
        { id: "nor_cm2", name: "P. Berg",      position: "MIL", rating: 78, stats: { PAC: 76, TIR: 68, PAS: 76, DRI: 72, DEF: 62, PHY: 80 } },
        { id: "nor_cm3", name: "M. Ødegaard", position: "MIL", rating: 88, stats: { PAC: 78, TIR: 82, PAS: 92, DRI: 88, DEF: 55, PHY: 70 } },
        { id: "nor_rw",  name: "A. Nusa",      position: "ATT", rating: 80, stats: { PAC: 92, TIR: 78, PAS: 72, DRI: 86, DEF: 32, PHY: 68 } },
        { id: "nor_lw",  name: "A. Sørloth",   position: "ATT", rating: 82, stats: { PAC: 78, TIR: 82, PAS: 65, DRI: 72, DEF: 38, PHY: 88 } },
        { id: "nor_st",  name: "E. Haaland",   position: "ATT", rating: 92, stats: { PAC: 88, TIR: 96, PAS: 68, DRI: 80, DEF: 35, PHY: 92 } },
      ],
    },
  },
];

export default function Simulator() {
  const { user } = useAuth();
  const { coins, submitResult, refresh } = useGameStats();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeMatchData, setActiveMatchData] = useState(REAL_MATCHES[0]);
  const [tactic, setTactic] = useState(TACTICS[0]);
  const [phase, setPhase] = useState("select");
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [currentMin, setCurrentMin] = useState(0);
  const [allEvents, setAllEvents] = useState([]);
  const [matchStats, setMatchStats] = useState(null);
  const [reward, setReward] = useState(0);
  const intervalRef = useRef(null);

  // Gère l'interchange physique d'un titulaire et d'un remplaçant
  const handleSubstitution = (titularId, benchPlayer) => {
    const currentHome = activeMatchData.home;
    const playerOut = currentHome.players.find(p => p.id === titularId);
    const newPlayers = currentHome.players.map(p => p.id === titularId ? benchPlayer : p);
    const newBench = currentHome.bench.map(p => p.id === benchPlayer.id ? playerOut : p);

    setActiveMatchData(prev => ({
      ...prev,
      home: { ...prev.home, players: newPlayers, bench: newBench }
    }));
  };

  function getTeamStats(team, tac = null) {
    const stats = calcTeamStats(team.players);
    if (!tac) return stats;
    return applyTactic(stats, tac);
  }

  const getLiveScore = (side) => {
    return visibleEvents.filter(e => e.type === "goal" && e.team === side).length;
  };

  function playHalf(half, match, currentTactic) {
    // Utilisation des données actives (avec les changements utilisateur pris en compte)
    const homeStats = getTeamStats(activeMatchData.home, activeMatchData.userSide === "home" ? currentTactic : null);
    const awayStats = getTeamStats(activeMatchData.away, activeMatchData.userSide === "away" ? currentTactic : null);
    const homeTactic = activeMatchData.userSide === "home" ? currentTactic : (activeMatchData.away.tactic ?? TACTICS[0]);
    const awayTactic = activeMatchData.userSide === "away" ? currentTactic : (activeMatchData.away.tactic ?? TACTICS[0]);

    const offset = half === 1 ? 0 : 45;
    const { events, halfStats, myGoals, aiGoals } = generateHalfEvents(
      null, null,
      activeMatchData.home.players, activeMatchData.away.players,
      offset,
      homeStats, awayStats,
      homeTactic, awayTactic
    );

    if (half === 1) {
      setVisibleEvents([]);
    }
    
    setCurrentMin(offset);
    setPhase(half === 1 ? "playing" : "playing2");

    let min = offset;
    intervalRef.current = setInterval(() => {
      min += 1;
      setCurrentMin(Math.min(min, offset + 45));
      
      if (half === 1) {
        setVisibleEvents(events.filter(e => e.minute <= min));
      } else {
        const mt1Events = allEvents.filter(e => e.minute <= 45);
        const currentMt2Events = events.filter(e => e.minute <= min);
        setVisibleEvents([...mt1Events, ...currentMt2Events]);
      }

      if (min >= offset + 45) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          if (half === 1) {
            setHomeScore(myGoals);
            setAwayScore(aiGoals);
            setAllEvents(events);
            setMatchStats(halfStats);
            setPhase("halftime");
          } else {
            const totalEvents = [...allEvents, ...events];
            const finalHome = totalEvents.filter(e => e.type === "goal" && e.team === "me").length;
            const finalAway = totalEvents.filter(e => e.type === "goal" && e.team === "ai").length;

            setHomeScore(finalHome);
            setAwayScore(finalAway);
            setAllEvents(totalEvents);
            setMatchStats(prev => prev ? mergeMatchStats(prev, halfStats) : halfStats);

            setReward(30);
            setPhase("result");
          }
        }, 800);
      }
    }, 400);
  }

  function startFirstHalf() { playHalf(1, selectedMatch, tactic); }
  function startSecondHalf() { playHalf(2, selectedMatch, tactic); }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function reset() {
    setPhase("select");
    setSelectedMatch(null);
    setActiveMatchData(REAL_MATCHES[0]); // Reset d'équipe complet
    setAllEvents([]);
    setVisibleEvents([]);
    setMatchStats(null);
    setHomeScore(0);
    setAwayScore(0);
    setReward(0);
  }

  function shareOnWhatsApp() {
    if (!selectedMatch) return;
    const text = `⚽ J'ai simulé ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam} sur World Cup Hub !\n\n🎯 Ma tactique : ${tactic.emoji} ${tactic.name}\n📊 Résultat simulé : ${homeScore}-${awayScore}\n\n👉 Simule toi aussi : worldcuphub2026.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-black to-green-900 text-white pb-20 select-none">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><span>🎮</span> Simulateur Tactique</h1>
            <p className="text-[10px] text-gray-400">Coupe du Monde 2026 · Mode de gestion</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 flex items-center gap-1.5">
            <span className="text-sm font-bold text-yellow-400">{coins}</span>
            <span className="text-xs">💰</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {/* ── SÉLECTION DU MATCH ───────────────────────────────────────── */}
        {phase === "select" && (
          <div>
            <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-white/10 rounded-2xl p-4 mb-5 shadow-inner">
              <p className="text-xs text-green-400 font-bold mb-1">💡 Analyse d'avant-match</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Configure le système du Sénégal pour contrer le pressing lourd de la Norvège d'Ødegaard et Haaland. Ajustez vos titulaires selon leur forme récente et vos plans tactiques ! 🎯
              </p>
            </div>

            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">📅 Match en vedette</h3>
            <div className="space-y-3">
              {REAL_MATCHES.map(match => (
                <motion.div key={match.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-sm"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">{match.group}</span>
                      <span className="text-xs text-gray-400 font-medium">Direct ce soir</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 my-4 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="text-center w-1/3">
                        <div className="text-4xl mb-1">{match.homeTeam.split(" ")[0]}</div>
                        <div className="text-sm font-bold text-white truncate">{match.homeTeam.split(" ").slice(1).join(" ")}</div>
                        <div className="text-[10px] text-green-400 font-bold mt-1 bg-green-500/10 py-0.5 px-2 rounded-full inline-block">Tu diriges</div>
                      </div>
                      <div className="text-xl font-black text-white/20 italic">VS</div>
                      <div className="text-center w-1/3">
                        <div className="text-4xl mb-1">{match.awayTeam.split(" ")[0]}</div>
                        <div className="text-sm font-bold text-white truncate">{match.awayTeam.split(" ").slice(1).join(" ")}</div>
                        <div className="text-[10px] text-red-400 font-bold mt-1 bg-red-500/10 py-0.5 px-2 rounded-full inline-block">IA Tactique</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 text-center mb-4 flex items-center justify-center gap-1">
                      <span>📍</span> {match.stadium}
                    </p>

                    <motion.button whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedMatch(match); setTactic(TACTICS[0]); setPhase("tactic"); }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition duration-200">
                      👔 Configurer le 11 & la Tactique
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHOIX TACTIQUE & MANAGEMENT ───────────────────────────────── */}
        {phase === "tactic" && selectedMatch && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-5 bg-white/5 p-3 rounded-xl border border-white/10">
              <button onClick={reset} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                <span>←</span> Retour
              </button>
              <span className="text-xs font-bold text-gray-300">Vestiaire tactique</span>
              <div className="w-12"></div>
            </div>

            {/* Nouveau panneau interactif de gestion des titulaires et banc */}
            <TeamManagement 
              titulars={activeMatchData.home.players} 
              bench={activeMatchData.home.bench} 
              selectedMatch={activeMatchData}
              onSubstitute={handleSubstitution}
            />

            {/* Sélection de la consigne collective */}
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">🎯 Consigne Collective</h3>
            <div className="space-y-2.5 mb-6">
              {TACTICS.map(t => {
                const selected = tactic.id === t.id;
                return (
                  <motion.button key={t.id} whileTap={{ scale: 0.99 }}
                    onClick={() => setTactic(t)}
                    className={`w-full text-left rounded-xl border p-3.5 transition relative overflow-hidden ${
                      selected ? "border-green-400 bg-green-500/10 shadow-md shadow-green-500/5" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="relative flex items-center gap-3">
                      <div className="text-2xl p-1.5 bg-white/5 rounded-lg">{t.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm flex items-center justify-between">
                          {t.name}
                          {selected && <span className="text-green-400 text-xs bg-green-400/20 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={startFirstHalf}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black py-4 rounded-xl text-md transition shadow-lg shadow-green-900/40">
              ⚽ Coup d'envoi de la simulation
            </motion.button>
          </motion.div>
        )}

        {/* ── MATCH EN COURS (TERRAIN ANIMÉ INCLUS) ─────────────────────── */}
        {(phase === "playing" || phase === "playing2") && selectedMatch && (
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-black/50 border border-white/10 rounded-2xl p-5 mb-5 text-center shadow-2xl"
            >
              <div className="text-[11px] text-gray-400 mb-3 tracking-widest font-mono uppercase bg-white/5 py-1 px-3 rounded-full inline-block">
                ⏱️ {Math.min(currentMin, 90)}' · {phase === "playing" ? "1ère période" : "2e période"}
              </div>
              
              <div className="flex items-center justify-center gap-6 my-2">
                <div className="text-center w-1/4">
                  <div className="text-3xl mb-1">{selectedMatch.homeTeam.split(" ")[0]}</div>
                  <div className="text-xs font-bold text-white truncate">{selectedMatch.home.name}</div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 font-mono">
                  <span className="text-4xl font-black text-white">{getLiveScore("me")}</span>
                  <span className="text-xl text-gray-600">-</span>
                  <span className="text-4xl font-black text-white">{getLiveScore("ai")}</span>
                </div>
                <div className="text-center w-1/4">
                  <div className="text-3xl mb-1">{selectedMatch.awayTeam.split(" ")[0]}</div>
                  <div className="text-xs font-bold text-white truncate">{selectedMatch.away.name}</div>
                </div>
              </div>
              
              <div className="text-xs text-green-400 font-medium mt-2">
                Tactique : {tactic.emoji} {tactic.name}
              </div>

              <div className="mt-4 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min((currentMin / 90) * 100, 100)}%` }}
                  transition={{ duration: 0.2 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </div>
            </motion.div>

            {/* Nouveau terrain tactique affichant les blocs en direct */}
            <TacticalPitch 
              homePlayers={activeMatchData.home.players} 
              awayPlayers={activeMatchData.away.players}
              currentEvent={visibleEvents[visibleEvents.length - 1]}
            />

            {/* Liste des actions */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 mt-4">
              <AnimatePresence initial={false}>
                {[...visibleEvents].reverse().map((event, i) => {
                  const isGoal = event.type === "goal";
                  const action = !isGoal ? KEY_ACTIONS[event.type] : null;
                  const isHome = event.team === "me";
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        isGoal
                          ? isHome 
                            ? "bg-green-500/10 border-green-500/30 text-green-300 font-bold shadow-sm shadow-green-500/5 animate-pulse" 
                            : "bg-red-500/10 border-red-500/30 text-red-300 font-bold shadow-sm shadow-red-500/5 animate-pulse"
                          : "bg-white/5 border-white/5 text-gray-300"
                      }`}
                    >
                      <span className="text-lg bg-black/20 p-1 rounded-lg w-8 h-8 flex items-center justify-center">
                        {isGoal ? "⚽" : action?.emoji}
                      </span>
                      <span className="text-xs font-mono text-gray-500 font-bold">{event.minute}'</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{event.player}</div>
                        <div className="text-[11px] text-gray-400 truncate">
                          {isGoal ? (isHome ? `But exceptionnel pour le Sénégal !` : `But encaissé...`) : action?.label}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {visibleEvents.length === 0 && (
                <div className="text-center text-xs text-gray-500 py-12 font-mono animate-pulse">
                  🏃‍♂️ Les joueurs se placent sur la pelouse...
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MI-TEMPS ─────────────────────────────────────────────────── */}
        {phase === "halftime" && selectedMatch && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-4">
              <div className="text-3xl mb-1">⏸️</div>
              <h2 className="text-xl font-bold">C'est la pause</h2>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-5 text-center">
              <div className="flex items-center justify-center gap-8 font-mono">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">{selectedMatch.home.name}</div>
                  <div className="text-4xl font-black mt-1 text-white">{homeScore}</div>
                </div>
                <span className="text-xl text-gray-600">-</span>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">{selectedMatch.away.name}</div>
                  <div className="text-4xl font-black mt-1 text-white">{awayScore}</div>
                </div>
              </div>
              <p className="text-xs text-gray-300 mt-4 bg-white/5 py-2 px-4 rounded-xl border border-white/5 inline-block">
                {homeScore > awayScore ? "🟢 Avantage au tableau, restons solides !" :
                 homeScore === awayScore ? "🟡 Match nul serré, tout va se jouer au retour." :
                 "🔴 Mené au score. Ajustez vos plans tactiques."}
              </p>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={startSecondHalf}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition">
              🏃‍♂️ Lancer la seconde période
            </motion.button>
          </motion.div>
        )}

        {/* ── RÉSULTAT ─────────────────────────────────────────────────── */}
        {phase === "result" && selectedMatch && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-2xl p-5 text-center mb-5 border bg-black/40 ${
              homeScore > awayScore ? "border-green-500/30" :
              homeScore === awayScore ? "border-yellow-500/30" :
              "border-red-500/30"
            }`}>
              <div className="text-4xl mb-2">
                {homeScore > awayScore ? "🏆" : homeScore === awayScore ? "🤝" : "😔"}
              </div>
              <h2 className="text-lg font-bold text-white mb-4">
                Match Terminé · Verdict du Tableau
              </h2>
              
              <div className="flex items-center justify-center gap-8 font-mono bg-white/5 p-4 rounded-xl border border-white/5 max-w-sm mx-auto">
                <div className="text-center">
                  <div className="text-2xl">{selectedMatch.homeTeam.split(" ")[0]}</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{selectedMatch.home.name}</div>
                  <div className="text-5xl font-black text-white mt-2">{homeScore}</div>
                </div>
                <span className="text-xl text-gray-600">-</span>
                <div className="text-center">
                  <div className="text-2xl">{selectedMatch.awayTeam.split(" ")[0]}</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{selectedMatch.away.name}</div>
                  <div className="text-5xl font-black text-white mt-2">{awayScore}</div>
                </div>
              </div>

              <div className="mt-5 bg-yellow-500/10 border border-yellow-400/20 rounded-xl px-4 py-3 text-center max-w-md mx-auto">
                <div className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-1">
                  <span>🎯</span> Score simulé enregistré !
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Si le vrai match de ce soir se termine sur ce score exact, ton compte empoche un énorme bonus de 200 💰.</p>
              </div>
            </div>

            {/* Stats post-match */}
            {matchStats && (
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-5">
                <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">📊 Rapport Statistique de la Simulation</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="font-bold text-white">{matchStats.possession.me}%</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Possession</span>
                    <span className="font-bold text-white">{matchStats.possession.ai}%</span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
                    <div className="bg-green-500" style={{ width: `${matchStats.possession.me}%` }} />
                    <div className="bg-red-500" style={{ width: `${matchStats.possession.ai}%` }} />
                  </div>
                </div>

                {[
                  { label: "Tirs Totaux", me: matchStats.shots.me, ai: matchStats.shots.ai },
                  { label: "Tirs Cadrés", me: matchStats.onTarget.me, ai: matchStats.onTarget.ai },
                  { label: "Expected Goals (xG)", me: matchStats.xG.me, ai: matchStats.xG.ai },
                ].map(({ label, me, ai }) => {
                  const total = me + ai || 1;
                  return (
                    <div key={label} className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="font-mono text-white font-bold">{me}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                        <span className="font-mono text-white font-bold">{ai}</span>
                      </div>
                      <div className="flex h-1 rounded-full overflow-hidden bg-white/5">
                        <div className="bg-green-500/70" style={{ width: `${Math.round((me/total)*100)}%` }} />
                        <div className="bg-red-500/70" style={{ width: `${Math.round((ai/total)*100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2.5">
              <motion.button whileTap={{ scale: 0.98 }} onClick={shareOnWhatsApp}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md">
                <span>📲</span> Envoyer le score sur WhatsApp
              </motion.button>

              <button onClick={reset}
                className="w-full bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white font-semibold py-3 rounded-xl transition border border-white/5">
                🔄 Recommencer une simulation tactique
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}