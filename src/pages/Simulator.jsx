// src/pages/Simulator.jsx
// Simulateur Tactique — simule de vrais matchs de la Coupe du Monde
// avec les vraies compositions et notre moteur de match.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useAuth }                      from "../hooks/useAuth";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import { TACTICS, generateHalfEvents, mergeMatchStats, calcTeamStats, applyTactic } from "../data/match-engine";
import { KEY_ACTIONS }                  from "../data/match-engine";

// ── Vrais matchs à simuler ────────────────────────────────────────────────
const REAL_MATCHES = [
  {
    id:        "sen_nor_2026",
    homeTeam:  "🇸🇳 Sénégal",
    awayTeam:  "🇳🇴 Norvège",
    group:     "Groupe I · 2e journée",
    stadium:   "MetLife Stadium, New Jersey",
    date:      "22 juin 2026",
    userSide:  "home", // L'utilisateur contrôle le Sénégal
    home: {
      name: "Sénégal",
      flag: "🇸🇳",
      formation: "4-2-3-1",
      rating: 81,
      players: [
        { id: "sn_gk",  name: "E. Mendy",    position: "GK",  rating: 86, stats: { PAC: 58, TIR: 18, PAS: 62, DRI: 42, DEF: 88, PHY: 84 } },
        { id: "sn_rb",  name: "M. Diouf",    position: "DEF", rating: 78, stats: { PAC: 82, TIR: 45, PAS: 68, DRI: 70, DEF: 74, PHY: 76 } },
        { id: "sn_cb1", name: "Koulibaly",   position: "DEF", rating: 85, stats: { PAC: 72, TIR: 38, PAS: 68, DRI: 62, DEF: 88, PHY: 90 } },
        { id: "sn_cb2", name: "Niakhate",    position: "DEF", rating: 79, stats: { PAC: 70, TIR: 35, PAS: 64, DRI: 58, DEF: 82, PHY: 84 } },
        { id: "sn_lb",  name: "K. Diatta",   position: "DEF", rating: 77, stats: { PAC: 84, TIR: 48, PAS: 70, DRI: 72, DEF: 70, PHY: 72 } },
        { id: "sn_dm1", name: "I. Gueye",    position: "MIL", rating: 80, stats: { PAC: 72, TIR: 58, PAS: 78, DRI: 72, DEF: 80, PHY: 82 } },
        { id: "sn_dm2", name: "P. Gueye",    position: "MIL", rating: 76, stats: { PAC: 74, TIR: 55, PAS: 74, DRI: 68, DEF: 72, PHY: 78 } },
        { id: "sn_am1", name: "Sadio Mané",  position: "ATT", rating: 87, stats: { PAC: 92, TIR: 84, PAS: 80, DRI: 88, DEF: 44, PHY: 80 } },
        { id: "sn_am2", name: "L. Camara",   position: "ATT", rating: 78, stats: { PAC: 82, TIR: 72, PAS: 76, DRI: 80, DEF: 38, PHY: 74 } },
        { id: "sn_am3", name: "I. Sarr",     position: "ATT", rating: 82, stats: { PAC: 90, TIR: 78, PAS: 72, DRI: 84, DEF: 35, PHY: 72 } },
        { id: "sn_st",  name: "N. Jackson",  position: "ATT", rating: 80, stats: { PAC: 82, TIR: 80, PAS: 62, DRI: 76, DEF: 30, PHY: 82 } },
      ],
    },
    away: {
      name: "Norvège",
      flag: "🇳🇴",
      formation: "4-3-3",
      rating: 84,
      tactic: TACTICS[2], // Pressing haut (style norvégien)
      players: [
        { id: "nor_gk",  name: "Ø. Nyland",   position: "GK",  rating: 80, stats: { PAC: 55, TIR: 15, PAS: 58, DRI: 38, DEF: 82, PHY: 80 } },
        { id: "nor_rb",  name: "Ryerson",      position: "DEF", rating: 78, stats: { PAC: 80, TIR: 42, PAS: 68, DRI: 66, DEF: 76, PHY: 78 } },
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
  const { user }                  = useAuth();
  const { coins, submitResult, refresh } = useGameStats();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [tactic,        setTactic]        = useState(TACTICS[0]);
  const [phase,         setPhase]         = useState("select"); // select | tactic | playing | playing2 | halftime | result
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [homeScore,     setHomeScore]     = useState(0);
  const [awayScore,     setAwayScore]     = useState(0);
  const [currentMin,    setCurrentMin]    = useState(0);
  const [allEvents,     setAllEvents]     = useState([]);
  const [matchStats,    setMatchStats]    = useState(null);
  const [reward,        setReward]        = useState(0);
  const intervalRef = useRef(null);

  // Calcul des stats des équipes
  function getTeamStats(team, tac = null) {
    const stats = calcTeamStats(team.players);
    if (!tac) return stats;
    return applyTactic(stats, tac);
  }

  function playHalf(half, match, currentTactic) {
    const homeStats = getTeamStats(match.home, match.userSide === "home" ? currentTactic : null);
    const awayStats = getTeamStats(match.away, match.userSide === "away" ? currentTactic : null);
    const homeTactic = match.userSide === "home" ? currentTactic : (match.away.tactic ?? TACTICS[0]);
    const awayTactic = match.userSide === "away" ? currentTactic : (match.away.tactic ?? TACTICS[0]);

    const offset = half === 1 ? 0 : 45;
    const { events, halfStats, myGoals, aiGoals } = generateHalfEvents(
      null, null,
      match.home.players, match.away.players,
      offset,
      homeStats, awayStats,
      homeTactic, awayTactic
    );

    setVisibleEvents([]);
    setCurrentMin(offset);
    setPhase(half === 1 ? "playing" : "playing2");

    let min = offset;
    intervalRef.current = setInterval(() => {
      min += 1;
      setCurrentMin(Math.min(min, offset + 45));
      setVisibleEvents(events.filter(e => e.minute <= min));

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
            const finalHome = homeScore + myGoals;
            const finalAway = awayScore + aiGoals;
            setHomeScore(finalHome);
            setAwayScore(finalAway);
            setAllEvents(prev => [...prev, ...events]);
            setMatchStats(prev => prev ? mergeMatchStats(prev, halfStats) : halfStats);

            // Récompense coins pour la simulation
            const coinsWon = 30;
            setReward(coinsWon);
            setPhase("result");
          }
        }, 800);
      }
    }, 600);
  }

  function startFirstHalf() {
    playHalf(1, selectedMatch, tactic);
  }

  function startSecondHalf() {
    playHalf(2, selectedMatch, tactic);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function reset() {
    setPhase("select");
    setSelectedMatch(null);
    setAllEvents([]);
    setVisibleEvents([]);
    setMatchStats(null);
    setHomeScore(0);
    setAwayScore(0);
  }

  // Partage WhatsApp
  function shareOnWhatsApp() {
    if (!selectedMatch) return;
    const text = `⚽ J'ai simulé ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam} sur World Cup Hub !\n\n🎯 Ma tactique : ${tactic.emoji} ${tactic.name}\n📊 Résultat simulé : ${homeScore}-${awayScore}\n\n👉 Simule toi aussi : worldcuphub2026.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-black to-green-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🎮 Simulateur Tactique</h1>
            <p className="text-xs text-gray-400">Simule les vrais matchs avec tes tactiques</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1">
            <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        {/* ── SÉLECTION DU MATCH ───────────────────────────────────────── */}
        {phase === "select" && (
          <div>
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 mb-5">
              <p className="text-xs text-yellow-300 font-bold mb-1">💡 Comment ça marche ?</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Choisis un vrai match, configure la tactique de ton équipe, et regarde comment le match se déroule selon ton plan. Si ton score simulé correspond au vrai résultat, tu gagnes des coins bonus ! 🎯
              </p>
            </div>

            <h3 className="font-bold text-white mb-3">📅 Matchs disponibles</h3>
            <div className="space-y-3">
              {REAL_MATCHES.map(match => (
                <motion.div key={match.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-r from-blue-900/40 to-green-900/40"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">{match.group}</span>
                      <span className="text-xs text-gray-400">{match.date}</span>
                    </div>

                    <div className="flex items-center justify-center gap-6 my-4">
                      <div className="text-center">
                        <div className="text-3xl mb-1">{match.homeTeam.split(" ")[0]}</div>
                        <div className="text-sm font-bold text-white">{match.homeTeam.split(" ").slice(1).join(" ")}</div>
                        <div className="text-[10px] text-green-400 mt-0.5">← Tu joues</div>
                      </div>
                      <div className="text-2xl font-black text-gray-500">VS</div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">{match.awayTeam.split(" ")[0]}</div>
                        <div className="text-sm font-bold text-white">{match.awayTeam.split(" ").slice(1).join(" ")}</div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center mb-3">📍 {match.stadium}</p>

                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedMatch(match); setPhase("tactic"); }}
                      className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl transition">
                      🎮 Simuler ce match
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHOIX TACTIQUE ───────────────────────────────────────────── */}
        {phase === "tactic" && selectedMatch && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-xl font-bold">Choisis ta tactique</h2>
              <p className="text-sm text-gray-400">
                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </p>
            </div>

            {/* Compositions des deux équipes */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[selectedMatch.home, selectedMatch.away].map((team, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs font-bold text-white mb-2">{team.flag} {team.name} ({team.formation})</p>
                  {["GK","DEF","MIL","ATT"].map(pos => {
                    const players = team.players.filter(p => p.position === pos);
                    if (!players.length) return null;
                    return (
                      <div key={pos} className="flex flex-wrap gap-1 mb-1">
                        <span className="text-[9px] text-gray-500 font-bold w-5">{pos}</span>
                        {players.map(p => (
                          <span key={p.id} className="text-[9px] text-gray-300 bg-white/5 px-1 py-0.5 rounded">
                            {p.name.split(" ").pop()}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Sélection tactique */}
            <div className="space-y-3 mb-5">
              {TACTICS.map(t => {
                const selected = tactic.id === t.id;
                return (
                  <motion.button key={t.id} whileTap={{ scale: 0.97 }}
                    onClick={() => setTactic(t)}
                    className={`w-full text-left rounded-2xl border p-4 transition relative overflow-hidden ${
                      selected ? "border-green-400 bg-green-500/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${t.color} opacity-10`} />
                    <div className="relative flex items-start gap-3">
                      <div className="text-2xl">{t.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {t.name}
                          {selected && <span className="text-green-400 text-xs">✓</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={startFirstHalf}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              ⚽ Lancer la simulation !
            </motion.button>
          </motion.div>
        )}

        {/* ── MATCH EN COURS ───────────────────────────────────────────── */}
        {(phase === "playing" || phase === "playing2") && selectedMatch && (
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center"
            >
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                ⏱️ {Math.min(currentMin, 90)}' · {phase === "playing" ? "1ère mi-temps" : "2e mi-temps"} · {tactic.emoji} {tactic.name}
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-1">{selectedMatch.homeTeam.split(" ")[0]}</div>
                  <div className="text-xs text-gray-400">{selectedMatch.home.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black">
                    {phase === "playing" ? "0" : homeScore}
                  </span>
                  <span className="text-2xl text-gray-400">-</span>
                  <span className="text-5xl font-black">
                    {phase === "playing" ? "0" : awayScore}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{selectedMatch.awayTeam.split(" ")[0]}</div>
                  <div className="text-xs text-gray-400">{selectedMatch.away.name}</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <motion.div
                  animate={{ width: `${Math.min((currentMin / 90) * 100, 100)}%` }}
                  transition={{ duration: 0.2 }}
                  className="h-2 bg-green-400 rounded-full"
                />
              </div>
            </motion.div>

            <div className="space-y-2">
              <AnimatePresence>
                {visibleEvents.map((event, i) => {
                  const isGoal = event.type === "goal";
                  const action = !isGoal ? KEY_ACTIONS[event.type] : null;
                  const isHome = event.team === "me";
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: isHome ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                        isGoal
                          ? isHome ? "bg-green-500/20 border border-green-400/30" : "bg-red-500/20 border border-red-400/30"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <span className="text-xl">{isGoal ? "⚽" : action?.emoji}</span>
                      <span className="text-xs text-gray-400 font-bold w-8">{event.minute}'</span>
                      <span className="text-sm font-bold text-white">{event.player}</span>
                      <span className="text-xs ml-auto">
                        {isGoal ? (isHome ? `✅ But ${selectedMatch.home.name}` : `❌ But ${selectedMatch.away.name}`) : action?.label}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {visibleEvents.length === 0 && (
                <div className="text-center text-gray-400 py-8 animate-pulse">⚽ Simulation en cours...</div>
              )}
            </div>
          </div>
        )}

        {/* ── MI-TEMPS ─────────────────────────────────────────────────── */}
        {phase === "halftime" && selectedMatch && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">⏸️</div>
              <h2 className="text-2xl font-black">Mi-temps</h2>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <div className="text-xs text-gray-400">{selectedMatch.home.name}</div>
                  <div className="text-5xl font-black">{homeScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div>
                  <div className="text-xs text-gray-400">{selectedMatch.away.name}</div>
                  <div className="text-5xl font-black">{awayScore}</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {homeScore > awayScore ? "🟢 Le Sénégal mène !" :
                 homeScore === awayScore ? "🟡 Match nul à la mi-temps" :
                 "🔴 La Norvège mène — il faut réagir !"}
              </p>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={startSecondHalf}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              ⚽ Reprendre la simulation
            </motion.button>
          </motion.div>
        )}

        {/* ── RÉSULTAT ─────────────────────────────────────────────────── */}
        {phase === "result" && selectedMatch && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-2xl p-6 text-center mb-5 border ${
              homeScore > awayScore ? "bg-green-500/20 border-green-400/40" :
              homeScore === awayScore ? "bg-yellow-500/20 border-yellow-400/40" :
              "bg-red-500/20 border-red-400/40"
            }`}>
              <div className="text-4xl mb-2">
                {homeScore > awayScore ? "🏆" : homeScore === awayScore ? "🤝" : "😔"}
              </div>
              <h2 className="text-xl font-black text-white mb-1">
                Résultat simulé avec {tactic.emoji} {tactic.name}
              </h2>
              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="text-center">
                  <div className="text-3xl">{selectedMatch.homeTeam.split(" ")[0]}</div>
                  <div className="text-xs text-gray-400">{selectedMatch.home.name}</div>
                  <div className="text-6xl font-black text-white mt-1">{homeScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-3xl">{selectedMatch.awayTeam.split(" ")[0]}</div>
                  <div className="text-xs text-gray-400">{selectedMatch.away.name}</div>
                  <div className="text-6xl font-black text-white mt-1">{awayScore}</div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2">
                <span className="text-yellow-400 font-bold">🎯 Score simulé sauvegardé !</span>
                <p className="text-xs text-gray-400 mt-1">Si ce score est le vrai résultat, tu gagnes 200 💰 bonus</p>
              </div>
            </div>

            {/* Stats post-match */}
            {matchStats && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <h3 className="font-bold text-white mb-4">📊 Statistiques de la simulation</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="font-bold text-white">{matchStats.possession.me}%</span>
                    <span>Possession</span>
                    <span className="font-bold text-white">{matchStats.possession.ai}%</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500" style={{ width: `${matchStats.possession.me}%` }} />
                    <div className="bg-red-500 flex-1" />
                  </div>
                </div>
                {[
                  { label: "Tirs", me: matchStats.shots.me, ai: matchStats.shots.ai },
                  { label: "Tirs cadrés", me: matchStats.onTarget.me, ai: matchStats.onTarget.ai },
                  { label: "xG", me: matchStats.xG.me, ai: matchStats.xG.ai },
                ].map(({ label, me, ai }) => {
                  const total = me + ai || 1;
                  return (
                    <div key={label} className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                        <span className="font-bold text-white">{me}</span>
                        <span>{label}</span>
                        <span className="font-bold text-white">{ai}</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500/70" style={{ width: `${Math.round((me/total)*100)}%` }} />
                        <div className="bg-red-500/70 flex-1" />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span className="text-green-400 font-bold">{selectedMatch.home.name}</span>
                  <span className="text-red-400 font-bold">{selectedMatch.away.name}</span>
                </div>
              </div>
            )}

            {/* Résumé des buts */}
            {allEvents.filter(e => e.type === "goal").length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <h3 className="font-bold text-white mb-3">⚽ Buts simulés</h3>
                {allEvents.filter(e => e.type === "goal").map((event, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm mb-1 ${
                    event.team === "me" ? "text-green-300" : "text-red-300"
                  }`}>
                    <span className="text-xs text-gray-400 w-8">{event.minute}'</span>
                    <span>⚽</span>
                    <span className="font-bold">{event.player}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {event.team === "me" ? selectedMatch.home.name : selectedMatch.away.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {/* Partage WhatsApp */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={shareOnWhatsApp}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2">
                📲 Partager ma simulation sur WhatsApp
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }} onClick={reset}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                🔄 Nouvelle simulation
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
