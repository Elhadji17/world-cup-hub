// src/pages/Simulator.jsx
// Simulateur Tactique — simule de vrais matchs avec les vraies compositions
// et notre moteur de match (zones + ticks + duels).

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import { TACTICS, generateHalfEvents, mergeMatchStats, calcTeamStats, applyTactic, KEY_ACTIONS } from "../data/match-engine";
import { SENEGAL_MATCH, NORWAY_MATCH }  from "../data/matchData";
import { getRecentFormMultiplier }      from "../data/match-form";

// Calcule la note live d'un joueur en tenant compte de sa forme récente
function getLiveRating(player) {
  const mult = getRecentFormMultiplier(player);
  return Math.round(player.rating * mult * 10) / 10;
}

// Formations disponibles pour le Sénégal
const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "5-3-2"];

export default function Simulator() {
  const { coins } = useGameStats();

  // État de la composition du Sénégal (modifiable par l'utilisateur)
  const [senegalPlayers, setSenegalPlayers] = useState(SENEGAL_MATCH.players);
  const [senegalBench,   setSenegalBench]   = useState(SENEGAL_MATCH.bench);
  const [formation,      setFormation]      = useState(SENEGAL_MATCH.formation);
  const [tactic,         setTactic]         = useState(TACTICS[0]);
  const [subTarget,      setSubTarget]      = useState(null); // joueur à remplacer

  // État de la simulation
  const [phase,         setPhase]         = useState("lineup"); // lineup | tactic | playing | halftime | playing2 | result
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [homeScore,     setHomeScore]     = useState(0);
  const [awayScore,     setAwayScore]     = useState(0);
  const [currentMin,    setCurrentMin]    = useState(0);
  const [allEvents,     setAllEvents]     = useState([]);
  const [matchStats,    setMatchStats]    = useState(null);
  const intervalRef = useRef(null);

  const norwayPlayers = NORWAY_MATCH.players;
  const norwayTactic  = TACTICS[2]; // Pressing haut (style norvégien)

  function handleSubstitute(benchPlayer) {
    if (!subTarget) return;
    setSenegalPlayers(prev => prev.map(p => p.id === subTarget.id ? benchPlayer : p));
    setSenegalBench(prev => prev.map(p => p.id === benchPlayer.id ? subTarget : p));
    setSubTarget(null);
  }

  function playHalf(half, currentTactic) {
    const myStats  = calcTeamStats(senegalPlayers);
    const aiStats  = calcTeamStats(norwayPlayers);
    const myAdj    = applyTactic(myStats, currentTactic);
    const offset   = half === 1 ? 0 : 45;

    const { events, halfStats, myGoals, aiGoals } = generateHalfEvents(
      null, null,
      senegalPlayers, norwayPlayers,
      offset,
      myAdj, aiStats,
      currentTactic, norwayTactic
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
            setPhase("result");
          }
        }, 800);
      }
    }, 600);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function reset() {
    setSenegalPlayers(SENEGAL_MATCH.players);
    setSenegalBench(SENEGAL_MATCH.bench);
    setFormation(SENEGAL_MATCH.formation);
    setTactic(TACTICS[0]);
    setPhase("lineup");
    setAllEvents([]);
    setVisibleEvents([]);
    setMatchStats(null);
    setHomeScore(0);
    setAwayScore(0);
  }

  function shareOnWhatsApp() {
    const text = `⚽ J'ai simulé Sénégal 🇸🇳 vs Norvège 🇳🇴 sur World Cup Hub !\n\n🎯 Ma tactique : ${tactic.emoji} ${tactic.name} · Formation : ${formation}\n📊 Résultat simulé : ${homeScore}-${awayScore}\n\nSimule toi aussi 👉 worldcuphub2026.vercel.app/simulator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Note de forme d'un joueur sous forme de badge couleur
  function FormBadge({ player }) {
    const mult = getRecentFormMultiplier(player);
    if (mult >= 1.05) return <span className="text-[9px] text-orange-400 font-bold">🔥</span>;
    if (mult <= 0.95) return <span className="text-[9px] text-blue-400 font-bold">😴</span>;
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-black to-green-950 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🎮 Simulateur Tactique</h1>
            <p className="text-xs text-gray-400">🇸🇳 Sénégal vs Norvège 🇳🇴 · CdM 2026</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1">
            <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        {/* ── COMPOSITION & REMPLACEMENTS ──────────────────────────────── */}
        {phase === "lineup" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Contexte du match */}
            <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-4 mb-5">
              <p className="text-xs text-red-300 font-bold mb-1">🚨 Contexte du match</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Le Sénégal est dos au mur après sa défaite 3-1 contre la France. La Norvège arrive en confiance avec une victoire 4-1 contre l'Irak. C'est un match de survie pour les Lions de la Teranga. Configure ta composition et lance la simulation !
              </p>
            </div>

            {/* Formation */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Formation</p>
              <div className="flex gap-2 flex-wrap">
                {FORMATIONS.map(f => (
                  <button key={f} onClick={() => setFormation(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      formation === f ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Titulaires Sénégal */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                🇸🇳 Titulaires {subTarget ? `— Remplacer ${subTarget.name}` : "(appuie pour remplacer)"}
              </p>
              <div className="space-y-1.5">
                {["GK","DEF","MIL","ATT"].map(pos => (
                  <div key={pos} className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-gray-500 font-bold w-6">{pos}</span>
                    {senegalPlayers.filter(p => p.position === pos).map(player => {
                      const isTarget = subTarget?.id === player.id;
                      return (
                        <button key={player.id}
                          onClick={() => setSubTarget(isTarget ? null : player)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition ${
                            isTarget
                              ? "border-yellow-400 bg-yellow-500/15 text-yellow-200"
                              : "border-white/10 bg-white/5 hover:bg-white/10 text-gray-200"
                          }`}>
                          <span className="font-bold text-gray-500 text-[9px]">#{player.number}</span>
                          <span>{player.name}</span>
                          <FormBadge player={player} />
                          <span className="text-[10px] text-gray-400 font-mono">{getLiveRating(player)}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Banc — visible si un joueur est sélectionné */}
            {subTarget && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-yellow-300">Faire entrer à la place de {subTarget.name} :</p>
                  <button onClick={() => setSubTarget(null)} className="text-[10px] text-gray-400 underline">Annuler</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {senegalBench.map(sub => (
                    <button key={sub.id} onClick={() => handleSubstitute(sub)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs text-gray-200 transition">
                      <span className="text-[9px] text-gray-500 font-bold">#{sub.number}</span>
                      <span>{sub.name}</span>
                      <span className="text-[10px] text-gray-400">{sub.position}</span>
                      <FormBadge sub={sub} />
                      <span className="text-[10px] text-gray-400 font-mono">{getLiveRating(sub)}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Norvège — lecture seule */}
            <div className="mb-5 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">🇳🇴 Norvège (4-3-3) — En confiance après 4-1</p>
              <div className="space-y-1">
                {["GK","DEF","MIL","ATT"].map(pos => (
                  <div key={pos} className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-gray-500 font-bold w-6">{pos}</span>
                    {norwayPlayers.filter(p => p.position === pos).map(p => (
                      <span key={p.id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                        #{p.number} {p.name}
                        {p.ratingBase >= 88 && <span className="text-yellow-400 ml-0.5">★</span>}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase("tactic")}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              ✅ Valider la composition →
            </motion.button>
          </motion.div>
        )}

        {/* ── CHOIX TACTIQUE ───────────────────────────────────────────── */}
        {phase === "tactic" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-xl font-bold">Choisis ta tactique</h2>
              <p className="text-sm text-gray-400">Formation : {formation} · Adversaire : Pressing haut norvégien ⚡</p>
            </div>

            <div className="space-y-3 mb-5">
              {TACTICS.map(t => {
                const selected = tactic.id === t.id;
                return (
                  <motion.button key={t.id} whileTap={{ scale: 0.97 }}
                    onClick={() => setTactic(t)}
                    className={`w-full text-left rounded-2xl border p-4 transition relative overflow-hidden ${
                      selected ? "border-green-400 bg-green-500/10" : "border-white/10 bg-white/5"
                    }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${t.color} opacity-10`} />
                    <div className="relative flex items-start gap-3">
                      <div className="text-2xl">{t.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {t.name} {selected && <span className="text-green-400 text-xs">✓</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase("lineup")}
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-2xl transition">
                ← Composition
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => playHalf(1, tactic)}
                className="flex-2 bg-green-500 hover:bg-green-400 text-white font-black py-3 px-8 rounded-2xl transition">
                ⚽ Lancer la simulation !
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── MATCH EN COURS ───────────────────────────────────────────── */}
        {(phase === "playing" || phase === "playing2") && (
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                ⏱️ {Math.min(currentMin, 90)}' · {phase === "playing" ? "1ère mi-temps" : "2e mi-temps"} · {tactic.emoji} {tactic.name}
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-3xl">🇸🇳</div>
                  <div className="text-xs text-gray-400">Sénégal</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black">{phase === "playing" ? "0" : homeScore}</span>
                  <span className="text-2xl text-gray-400">-</span>
                  <span className="text-5xl font-black">{phase === "playing" ? "0" : awayScore}</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl">🇳🇴</div>
                  <div className="text-xs text-gray-400">Norvège</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <motion.div animate={{ width: `${Math.min((currentMin / 90) * 100, 100)}%` }}
                  transition={{ duration: 0.2 }} className="h-2 bg-green-400 rounded-full" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <AnimatePresence>
                {visibleEvents.map((event, i) => {
                  const isGoal = event.type === "goal";
                  const action = !isGoal ? KEY_ACTIONS[event.type] : null;
                  const isSen  = event.team === "me";
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: isSen ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                        isGoal
                          ? isSen ? "bg-green-500/20 border border-green-400/30" : "bg-red-500/20 border border-red-400/30"
                          : "bg-white/5 border border-white/10"
                      }`}>
                      <span className="text-xl">{isGoal ? "⚽" : action?.emoji}</span>
                      <span className="text-xs text-gray-400 font-bold w-8">{event.minute}'</span>
                      <span className="text-sm font-bold">{event.player}</span>
                      <span className="text-xs ml-auto">
                        {isGoal ? (isSen ? "✅ But Sénégal !" : "❌ But Norvège") : action?.label}
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
        {phase === "halftime" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">⏸️</div>
              <h2 className="text-2xl font-black">Mi-temps</h2>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center">
              <div className="flex items-center justify-center gap-8">
                <div><div className="text-xs text-gray-400">🇸🇳 Sénégal</div><div className="text-5xl font-black">{homeScore}</div></div>
                <span className="text-2xl text-gray-400">-</span>
                <div><div className="text-xs text-gray-400">🇳🇴 Norvège</div><div className="text-5xl font-black">{awayScore}</div></div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {homeScore > awayScore ? "🟢 Le Sénégal mène — continuez sur cette lancée !" :
                 homeScore === awayScore ? "🟡 Nul à la pause — un but peut tout changer" :
                 "🔴 Le Sénégal est mené — il faut réagir maintenant !"}
              </p>
            </div>

            {/* Option de changer de tactique à la mi-temps */}
            <p className="text-xs text-gray-400 mb-3 text-center font-bold">Ajuste ta tactique pour la 2e mi-temps :</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {TACTICS.map(t => (
                <button key={t.id} onClick={() => setTactic(t)}
                  className={`text-left p-3 rounded-xl border transition ${
                    tactic.id === t.id ? "border-green-400 bg-green-500/10" : "border-white/10 bg-white/5"
                  }`}>
                  <div className="text-base mb-0.5">{t.emoji}</div>
                  <div className="text-xs font-bold text-white">{t.name}</div>
                </button>
              ))}
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => playHalf(2, tactic)}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              ⚽ Reprendre la simulation
            </motion.button>
          </motion.div>
        )}

        {/* ── RÉSULTAT ─────────────────────────────────────────────────── */}
        {phase === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-2xl p-6 text-center mb-5 border ${
              homeScore > awayScore ? "bg-green-500/20 border-green-400/40" :
              homeScore === awayScore ? "bg-yellow-500/20 border-yellow-400/40" :
              "bg-red-500/20 border-red-400/40"
            }`}>
              <div className="text-4xl mb-2">
                {homeScore > awayScore ? "🏆" : homeScore === awayScore ? "🤝" : "😔"}
              </div>
              <h2 className="text-lg font-black mb-1">Résultat de ta simulation</h2>
              <p className="text-xs text-gray-400 mb-4">{tactic.emoji} {tactic.name} · Formation {formation}</p>

              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl">🇸🇳</div>
                  <div className="text-xs text-gray-400 mb-1">Sénégal</div>
                  <div className="text-6xl font-black">{homeScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-4xl">🇳🇴</div>
                  <div className="text-xs text-gray-400 mb-1">Norvège</div>
                  <div className="text-6xl font-black">{awayScore}</div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2">
                <p className="text-yellow-400 font-bold text-sm">🎯 Score sauvegardé !</p>
                <p className="text-xs text-gray-400 mt-0.5">Si c'est le vrai résultat ce soir, tu gagnes 200 💰 bonus</p>
              </div>
            </div>

            {/* Stats */}
            {matchStats && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <h3 className="font-bold mb-4">📊 Stats de la simulation</h3>
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
                  { label: "Cadrés", me: matchStats.onTarget.me, ai: matchStats.onTarget.ai },
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
                <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                  <span className="text-green-400">🇸🇳 Sénégal</span>
                  <span className="text-red-400">🇳🇴 Norvège</span>
                </div>
              </div>
            )}

            {/* Buts */}
            {allEvents.filter(e => e.type === "goal").length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <h3 className="font-bold mb-3">⚽ Buts simulés</h3>
                {allEvents.filter(e => e.type === "goal").map((event, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm mb-1 ${
                    event.team === "me" ? "text-green-300" : "text-red-300"
                  }`}>
                    <span className="text-xs text-gray-400 w-8">{event.minute}'</span>
                    <span>⚽</span>
                    <span className="font-bold">{event.player}</span>
                    <span className="text-xs text-gray-400 ml-auto">{event.team === "me" ? "🇸🇳" : "🇳🇴"}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={shareOnWhatsApp}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
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
