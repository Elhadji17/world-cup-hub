// src/pages/Simulator.jsx — Simulateur Tactique · Coupe du Monde 2026
// Architecture générique : charge n'importe quel match depuis matchRegistry

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import { TACTICS, KEY_ACTIONS }         from "../data/match-engine";
import { getRecentFormMultiplier }      from "../data/match-form";
import { MATCH_REGISTRY }               from "../data/matchRegistry";
import { registryToModule }             from "../data/matchGenerator";
import MatchField                        from "../components/MatchField";
import PaletteTactique                   from "../components/PaletteTactique";

// Import statique des matchs avec données complètes
import * as SenNor from "../data/matches/sen_nor_2026.js";
import * as SenIra from "../data/matches/sen_ira_2026.js";
import * as SenBel from "../data/matches/sen_bel_2026.js";

const MATCH_MODULES_FULL = {
  sen_nor_2026: SenNor,
  sen_ira_2026: SenIra,
  sen_bel_2026: SenBel,
};

const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "5-3-2"];

function getLiveRating(player) {
  const mult = getRecentFormMultiplier(player);
  return Math.round((player.rating ?? player.ratingBase ?? 70) * mult * 10) / 10;
}

function FormBadge({ player }) {
  if (!player) return null;
  const mult = getRecentFormMultiplier(player);
  if (mult >= 1.05) return <span className="text-[9px] text-orange-400 font-bold">🔥</span>;
  if (mult <= 0.95) return <span className="text-[9px] text-blue-400 font-bold">😴</span>;
  return null;
}

function MatchRecap({ events, title }) {
  if (!events || events.length === 0) return null;
  const goals   = events.filter(e => e.type === "goal");
  const shots   = events.filter(e => ["shot","miss","header","goal"].includes(e.type));
  const corners = events.filter(e => e.type === "corner").length;
  const yellows = events.filter(e => e.type === "yellow").length;
  // Parades = événements "save" peu importe l'équipe
  const saves   = events.filter(e => e.type === "save").length;
  // Ratés = événements "miss" peu importe l'équipe
  const misses  = events.filter(e => e.type === "miss").length;
  const headers = events.filter(e => e.type === "header").length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
      <h3 className="font-bold text-white mb-3 text-sm">{title}</h3>
      {goals.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">⚽ Buts</p>
          {goals.map((g, i) => {
            const isSen = g.team === "me" || g.team === "sen";
            return (
              <div key={i} className={`flex items-center gap-2 text-xs mb-1 ${isSen ? "text-green-300" : "text-red-300"}`}>
                <span className="font-mono text-gray-400 w-8">{g.minute}'</span>
                <span>⚽</span>
                <span className="font-bold">{g.player}</span>
                <span className="ml-auto">{isSen ? "🇸🇳" : "🏳️"}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Tirs", value: shots.length, emoji: "🎯" },
          { label: "Parades", value: saves, emoji: "🧤" },
          { label: "Ratés", value: misses, emoji: "😬" },
          { label: "Corners", value: corners, emoji: "🚩" },
          { label: "Cartons", value: yellows, emoji: "🟨" },
          { label: "Aériens", value: headers, emoji: "🤯" },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-lg">{emoji}</div>
            <div className="text-white font-bold text-sm">{value}</div>
            <div className="text-[9px] text-gray-400 leading-tight mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Panneau de pause tactique — composant séparé (règles des hooks) ──────
function PauseTactiquePanel({
  currentMin, homeScore, awayScore,
  tactic, senegalPlayers, senegalBench,
  pendingTactic, setPendingTactic,
  onResume, onSubstitute,
  getLiveRating, FormBadge, TACTICS,
}) {
  const [pauseTab, setPauseTab] = useState("tactic");
  const [subOut,   setSubOut]   = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      style={{ overflowY: "auto" }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden my-4"
      >
        {/* Header */}
        <div className="bg-yellow-500/20 border-b border-yellow-400/20 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">⏸ Match en pause</div>
            <div className="text-white font-black text-lg">{currentMin}' — Ajustements</div>
          </div>
          <div className="text-2xl font-black text-white">{homeScore} - {awayScore}</div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-white/10">
          {[
            { id: "tactic", label: "🎯 Tactique" },
            { id: "sub",    label: "🔄 Remplacements" },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setPauseTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-bold transition ${
                pauseTab === tab.id
                  ? "border-b-2 border-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">

          {/* ── ONGLET TACTIQUE ── */}
          {pauseTab === "tactic" && (
            <>
              <p className="text-xs text-gray-400">
                Les flèches sur le terrain s'adapteront immédiatement.
              </p>
              <div className="space-y-2">
                {TACTICS.map(t => {
                  const isSelected = (pendingTactic ?? tactic).id === t.id;
                  const isCurrent  = tactic.id === t.id;
                  return (
                    <motion.button key={t.id} whileTap={{ scale: 0.97 }}
                      onClick={() => setPendingTactic(t)}
                      className={`w-full text-left p-3 rounded-xl border transition relative overflow-hidden ${
                        isSelected ? "border-yellow-400 bg-yellow-500/10" : "border-white/10 bg-white/5"
                      }`}>
                      <div className={`absolute inset-0 bg-gradient-to-r ${t.color} opacity-10`}/>
                      <div className="relative flex items-center gap-3">
                        <span className="text-xl">{t.emoji}</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {t.name}
                            {isCurrent && <span className="text-[9px] bg-white/20 text-gray-300 px-1.5 py-0.5 rounded">Actuelle</span>}
                            {isSelected && !isCurrent && <span className="text-[9px] bg-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded">Nouveau</span>}
                          </div>
                          <div className="text-xs text-gray-400">{t.desc}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── ONGLET REMPLACEMENTS ── */}
          {pauseTab === "sub" && (
            <>
              <p className="text-xs text-gray-400">
                {subOut
                  ? `Choisir le remplaçant de ${subOut.name} :`
                  : "Sélectionne le joueur à remplacer :"}
              </p>

              {/* Titulaires — choisir qui sort */}
              {!subOut && (
                <div className="space-y-1">
                  {["GK","DEF","MIL","ATT"].map(pos => (
                    <div key={pos} className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] text-gray-500 font-bold w-6">{pos}</span>
                      {senegalPlayers.filter(p => p.position === pos).map(player => (
                        <button key={player.id}
                          onClick={() => setSubOut(player)}
                          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/30 rounded-lg text-xs text-gray-200 transition">
                          <span className="text-[9px] text-gray-500">#{player.number}</span>
                          <span>{player.name}</span>
                          <FormBadge player={player} />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Banc — choisir qui entre */}
              {subOut && (
                <>
                  <div className="bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2 flex items-center justify-between">
                    <div className="text-xs text-red-300">
                      ← Sort : <span className="font-bold text-white">{subOut.name}</span>
                    </div>
                    <button onClick={() => setSubOut(null)} className="text-[10px] text-gray-400 underline">Annuler</button>
                  </div>
                  <div className="space-y-1.5">
                    {senegalBench.map(sub => {
                      const compatible = sub.position === subOut.position;
                      return (
                        <button key={sub.id}
                          onClick={() => {
                            onSubstitute(subOut, sub);
                            setSubOut(null);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition ${
                            compatible
                              ? "border-green-400/30 bg-green-500/10 hover:bg-green-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-gray-500">#{sub.number}</span>
                              <span className="text-sm font-bold text-white">{sub.name}</span>
                              <FormBadge player={sub} />
                              {compatible && <span className="text-[9px] text-green-400">✓ Même poste</span>}
                            </div>
                            <div className="text-[10px] text-gray-400">{sub.position}</div>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{getLiveRating(sub)}</span>
                          <span className="text-green-400 text-sm">→</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-1">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onResume(null)}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl text-sm">
              ▶ Reprendre
            </motion.button>
            {pendingTactic && pendingTactic.id !== tactic.id && (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => onResume(pendingTactic)}
                className="flex-2 bg-yellow-500 text-black font-black py-3 px-5 rounded-xl text-sm">
                ✅ Appliquer
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Simulator() {
  const { coins } = useGameStats();

  // Sélection du match
  const [selectedMatchId,  setSelectedMatchId]  = useState(null);
  const [matchModule,      setMatchModule]       = useState(null);
  const [matchMeta,        setMatchMeta]         = useState(null);

  // Composition
  const [senegalPlayers,   setSenegalPlayers]   = useState([]);
  const [senegalBench,     setSenegalBench]     = useState([]);
  const [formation,        setFormation]        = useState("4-3-3");
  const [tactic,           setTactic]           = useState(TACTICS[0]);
  const [subTarget,        setSubTarget]        = useState(null);

  // Simulation
  const [phase,            setPhase]            = useState("select");
  const [visibleEvents,    setVisibleEvents]    = useState([]);
  const [homeScore,        setHomeScore]        = useState(0);
  const [awayScore,        setAwayScore]        = useState(0);
  const [currentMin,       setCurrentMin]       = useState(0);
  const [allEvents,        setAllEvents]        = useState([]);
  const [half1Events,      setHalf1Events]      = useState([]);
  const [matchStats,       setMatchStats]       = useState(null);
  const [showPalette,      setShowPalette]      = useState(false);
  // ── Système de pause tactique ──
  const [isPaused,         setIsPaused]         = useState(false);
  const [showPauseTactic,  setShowPauseTactic]  = useState(false);
  const [pendingTactic,    setPendingTactic]    = useState(null); // tactique choisie pendant la pause
  const intervalRef = useRef(null);
  const pausedMinRef = useRef(0); // minute au moment de la pause

  function selectMatch(matchId) {
    const meta = MATCH_REGISTRY.find(m => m.id === matchId);
    if (!meta) return;

    // Charger le module selon le niveau de données
    let module;
    if (meta.dataLevel === "full" && MATCH_MODULES_FULL[matchId]) {
      // Données complètes — fichier dédié
      module = MATCH_MODULES_FULL[matchId];
    } else {
      // Données auto — génération depuis les notes FIFA
      module = registryToModule(meta);
    }

    setSelectedMatchId(matchId);
    setMatchMeta(meta);
    setMatchModule(module);
    setSenegalPlayers(module.SENEGAL_MATCH.players);
    setSenegalBench(module.SENEGAL_MATCH.bench ?? []);
    setFormation(module.SENEGAL_MATCH.formation ?? "4-3-3");
    setPhase("lineup");
  }

  function handleSubstitute(benchPlayer) {
    if (!subTarget) return;
    setSenegalPlayers(prev => prev.map(p => p.id === subTarget.id ? benchPlayer : p));
    setSenegalBench(prev => prev.map(p => p.id === benchPlayer.id ? subTarget : p));
    setSubTarget(null);
  }

  function pauseMatch() {
    clearInterval(intervalRef.current);
    pausedMinRef.current = currentMin;
    setIsPaused(true);
    setShowPauseTactic(true);
  }

  function resumeMatch(newTactic) {
    // Si nouvelle tactique choisie, l'appliquer + injecter événement narratif
    if (newTactic && newTactic.id !== tactic.id) {
      setTactic(newTactic);
      // Injecter un événement narratif de changement tactique
      const tacticEvent = {
        minute: currentMin,
        type: "text",
        team: "me",
        player: "",
        desc: `🔄 Changement tactique à la ${currentMin}' — Le Sénégal passe en ${newTactic.emoji} ${newTactic.name}. Les flèches s'adaptent immédiatement sur le terrain.`,
        scripted: true,
      };
      setVisibleEvents(prev => [...prev, tacticEvent]);
      setAllEvents(prev => [...prev, tacticEvent]);
    }
    setShowPauseTactic(false);
    setIsPaused(false);
    // Relancer le chrono depuis la minute où on s'est arrêté
    const offset = phase === "playing" ? 0 : 45;
    let min = pausedMinRef.current;
    intervalRef.current = setInterval(() => {
      min += 1;
      setCurrentMin(Math.min(min, offset + 45));
      // Recharger les events visibles depuis les allEvents actuels
      setVisibleEvents(prev => {
        const currentEvents = matchModule?.getScriptedEventsForHalf(
          phase === "playing" ? 1 : 2,
          (newTactic ?? tactic).id,
          senegalPlayers,
          formation
        ) ?? [];
        return currentEvents.filter(e => e.minute <= min);
      });
      if (min >= offset + 45) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          const half = phase === "playing" ? 1 : 2;
          const events = matchModule?.getScriptedEventsForHalf(half, (newTactic ?? tactic).id, senegalPlayers, formation) ?? [];
          const halfSenGoals  = events.filter(e => e.type === "goal" && (e.team === "me" || e.team === "sen")).length;
          const halfAwayGoals = events.filter(e => e.type === "goal" && e.team === "ai").length;
          if (half === 1) {
            setHomeScore(halfSenGoals);
            setAwayScore(halfAwayGoals);
            setAllEvents(events);
            setHalf1Events(events);
            setPhase("halftime");
          } else {
            setHomeScore(homeScore + halfSenGoals);
            setAwayScore(awayScore + halfAwayGoals);
            setPhase("result");
          }
        }, 800);
      }
    }, 1000);
  }

  function handleInMatchSubstitute(outPlayer, inPlayer) {
    // Effectuer le remplacement
    setSenegalPlayers(prev => prev.map(p => p.id === outPlayer.id ? inPlayer : p));
    setSenegalBench(prev => prev.map(p => p.id === inPlayer.id ? outPlayer : p));
    // Injecter événement narratif
    const subEvent = {
      minute: currentMin,
      type: "sub",
      team: "me",
      player: inPlayer.name,
      desc: `🔄 ${inPlayer.name} entre à la place de ${outPlayer.name} à la ${currentMin}'. ${
        inPlayer.id === "ndiaye_13" ? "L'impact du super-sub attendu !" :
        inPlayer.id === "gueye_26"  ? "Pape Gueye cherchera le but depuis le milieu !" :
        inPlayer.id === "diarra_21" ? "Habib Diarra apporte de l'énergie et du pressing !" :
        "Changement tactique opéré par le coach."
      }`,
      scripted: true,
    };
    setVisibleEvents(prev => [...prev, subEvent].sort((a,b) => a.minute - b.minute));
    setAllEvents(prev => [...prev, subEvent]);
    // Reprendre le match
    resumeMatch(pendingTactic);
  }
    if (!matchModule) return;
    const f = formation || "4-3-3";
    const offset = half === 1 ? 0 : 45;

    // Récupérer les événements scénarisés — ils contiennent déjà les buts
    const events = matchModule.getScriptedEventsForHalf(half, currentTactic.id, senegalPlayers, f);

    // Compter les buts depuis les événements scénarisés (pas de doublon)
    const halfSenGoals  = events.filter(e => e.type === "goal" && (e.team === "me" || e.team === "sen")).length;
    const halfAwayGoals = events.filter(e => e.type === "goal" && e.team === "ai").length;

    // Score total cumulé (1ère + 2e mi-temps)
    const totalSenGoals  = half === 1 ? halfSenGoals : homeScore + halfSenGoals;
    const totalAwayGoals = half === 1 ? halfAwayGoals : awayScore + halfAwayGoals;

    const sorted = events.sort((a, b) => a.minute - b.minute);
    const possSen = half === 1 ? 58 : 62;
    const halfStats = {
      possession: { me: possSen, ai: 100 - possSen },
      shots:      { me: 7 + halfSenGoals * 2,  ai: 3 + halfAwayGoals },
      onTarget:   { me: 3 + halfSenGoals,       ai: 1 + halfAwayGoals },
      xG:         { me: parseFloat((halfSenGoals * 0.7 + 0.5).toFixed(1)),
                    ai: parseFloat((halfAwayGoals * 0.5 + 0.2).toFixed(1)) },
    };

    setVisibleEvents([]);
    setCurrentMin(offset);
    setIsPaused(false);
    setPhase(half === 1 ? "playing" : "playing2");

    let min = offset;
    intervalRef.current = setInterval(() => {
      // Ne pas avancer si en pause
      if (isPaused) return;
      min += 1;
      setCurrentMin(Math.min(min, offset + 45));
      setVisibleEvents(sorted.filter(e => e.minute <= min));

      if (min >= offset + 45) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          if (half === 1) {
            setHomeScore(halfSenGoals);
            setAwayScore(halfAwayGoals);
            setAllEvents(sorted);
            setHalf1Events(sorted);
            setMatchStats(halfStats);
            setPhase("halftime");
          } else {
            setHomeScore(totalSenGoals);
            setAwayScore(totalAwayGoals);
            setAllEvents(prev => [...prev, ...sorted]);
            setMatchStats(prev => prev ? {
              possession: { me: Math.round((prev.possession.me + halfStats.possession.me) / 2), ai: Math.round((prev.possession.ai + halfStats.possession.ai) / 2) },
              shots:      { me: prev.shots.me + halfStats.shots.me,       ai: prev.shots.ai + halfStats.shots.ai },
              onTarget:   { me: prev.onTarget.me + halfStats.onTarget.me, ai: prev.onTarget.ai + halfStats.onTarget.ai },
              xG:         { me: parseFloat((prev.xG.me + halfStats.xG.me).toFixed(1)), ai: parseFloat((prev.xG.ai + halfStats.xG.ai).toFixed(1)) },
            } : halfStats);
            setPhase("result");
          }
        }, 800);
      }
    }, 1000);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function reset() {
    setPhase("select");
    setSelectedMatchId(null);
    setMatchModule(null);
    setMatchMeta(null);
    setSenegalPlayers([]);
    setSenegalBench([]);
    setAllEvents([]); setHalf1Events([]);
    setVisibleEvents([]); setMatchStats(null);
    setHomeScore(0); setAwayScore(0);
    setTactic(TACTICS[0]);
  }

  function shareOnWhatsApp() {
    if (!matchMeta) return;
    const text = `⚽ J'ai simulé ${matchMeta.homeTeam.flag} ${matchMeta.homeTeam.name} vs ${matchMeta.awayTeam.flag} ${matchMeta.awayTeam.name} sur World Cup Hub !\n\n🎯 Tactique : ${tactic.emoji} ${tactic.name} · Formation : ${formation}\n📊 Score simulé : ${homeScore}-${awayScore}\n\nSimule aussi 👉 worldcuphub2026.vercel.app/simulator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const awayTeamName  = matchMeta?.awayTeam?.name  ?? "Adversaire";
  const awayTeamFlag  = matchMeta?.awayTeam?.flag  ?? "🏳️";
  const awayPlayers   = matchModule?.AWAY_MATCH?.players ?? matchModule?.NORWAY_MATCH?.players ?? [];
  const matchContext  = matchModule?.MATCH_CONTEXT;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-black to-green-950 text-white pb-20">
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🎮 Simulateur Tactique</h1>
            <p className="text-xs text-gray-400">Coupe du Monde 2026 · 🇸🇳 Sénégal</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1">
            <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        {/* ── SÉLECTION DU MATCH ── */}
        {phase === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-2xl p-4 mb-5">
              <p className="text-xs text-yellow-300 font-bold mb-1">💡 Comment ça marche ?</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Choisis un match, configure la tactique du Sénégal, et regarde la simulation se dérouler. Si ton score prédit correspond au vrai résultat → 200 💰 bonus !
              </p>
            </div>

            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">📅 Matchs disponibles</h3>

            {/* Matchs Sénégal en premier */}
            <div className="mb-2">
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-wide mb-2">🇸🇳 Matchs Sénégal — Données complètes</p>
              <div className="space-y-3">
                {MATCH_REGISTRY.filter(m => m.dataLevel === "full").map(match => (
                  <motion.div key={match.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl border border-green-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20" />
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">{match.group}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-green-600/80 text-white px-2 py-0.5 rounded-full">✅ Données complètes</span>
                          {match.status === "finished" && <span className="text-[9px] bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">Terminé</span>}
                          {match.status === "upcoming" && <span className="text-[9px] bg-yellow-600 text-white px-2 py-0.5 rounded-full font-bold">⚡ À venir</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-6 my-3">
                        <div className="text-center">
                          <div className="text-3xl">{match.homeTeam.flag}</div>
                          <div className="text-xs font-bold text-white mt-1">{match.homeTeam.name}</div>
                          <div className="text-[9px] text-gray-500">{match.homeTeam.fifaRating} FIFA</div>
                          <div className="text-[9px] text-green-400">← Tu joues</div>
                        </div>
                        <div className="text-xl font-black text-gray-500">VS</div>
                        <div className="text-center">
                          <div className="text-3xl">{match.awayTeam.flag}</div>
                          <div className="text-xs font-bold text-white mt-1">{match.awayTeam.name}</div>
                          <div className="text-[9px] text-gray-500">{match.awayTeam.fifaRating} FIFA</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 text-center mb-3">📍 {match.stadium} · {match.date}</p>
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => selectMatch(match.id)}
                        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-2.5 rounded-xl transition text-sm">
                        🎮 {match.status === "finished" ? "Rejouer" : "Simuler ce match"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Autres matchs auto */}
            <div className="mt-5">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wide mb-2">🌍 Autres matchs — Simulation automatique</p>
              <div className="space-y-2">
                {MATCH_REGISTRY.filter(m => m.dataLevel === "auto").map(match => (
                  <motion.div key={match.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-xl border border-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 to-purple-900/15" />
                    <div className="relative p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xl">{match.homeTeam.flag}</div>
                            <div className="text-[9px] text-gray-400">{match.homeTeam.name}</div>
                            <div className="text-[8px] text-gray-600">{match.homeTeam.fifaRating}</div>
                          </div>
                          <span className="text-xs text-gray-500 font-black">VS</span>
                          <div className="text-center">
                            <div className="text-xl">{match.awayTeam.flag}</div>
                            <div className="text-[9px] text-gray-400">{match.awayTeam.name}</div>
                            <div className="text-[8px] text-gray-600">{match.awayTeam.fifaRating}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[8px] bg-blue-600/50 text-blue-300 px-1.5 py-0.5 rounded">🤖 Auto</span>
                          <motion.button whileTap={{ scale: 0.97 }}
                            onClick={() => selectMatch(match.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition text-xs">
                            Simuler
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── COMPOSITION ── */}
        {phase === "lineup" && matchMeta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {matchContext && (
              <div className={`border rounded-2xl p-4 mb-5 ${
                matchContext.urgency === "critical"
                  ? "bg-red-500/10 border-red-400/20"
                  : "bg-blue-500/10 border-blue-400/20"
              }`}>
                <p className={`text-xs font-bold mb-1 ${matchContext.urgency === "critical" ? "text-red-300" : "text-blue-300"}`}>
                  {matchContext.urgency === "critical" ? "🚨" : "ℹ️"} {matchContext.title}
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">{matchContext.description}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Formation</p>
              <div className="flex gap-2 flex-wrap">
                {FORMATIONS.map(f => (
                  <button key={f} onClick={() => setFormation(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      formation === f ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}>{f}</button>
                ))}
              </div>
            </div>

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
                        <button key={player.id} onClick={() => setSubTarget(isTarget ? null : player)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition ${
                            isTarget ? "border-yellow-400 bg-yellow-500/15 text-yellow-200" : "border-white/10 bg-white/5 hover:bg-white/10 text-gray-200"
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
                      <FormBadge player={sub} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Adversaire */}
            <div className="mb-5 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                {awayTeamFlag} {awayTeamName}
              </p>
              {matchContext?.awayContext && (
                <p className="text-[10px] text-gray-500 mb-2 italic">{matchContext.awayContext}</p>
              )}
              <div className="space-y-1">
                {["GK","DEF","MIL","ATT"].map(pos => (
                  <div key={pos} className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-gray-500 font-bold w-6">{pos}</span>
                    {awayPlayers.filter(p => p.position === pos).map(p => (
                      <span key={p.id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                        #{p.number} {p.name}{(p.ratingBase ?? 0) >= 85 ? " ★" : ""}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase("select")}
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-2xl">← Matchs</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase("tactic")}
                className="flex-2 bg-green-500 hover:bg-green-400 text-white font-black py-3 px-8 rounded-2xl">
                ✅ Valider →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── CHOIX TACTIQUE ── */}
        {phase === "tactic" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-xl font-bold">Choisis ta tactique</h2>
              <p className="text-sm text-gray-400">Formation : {formation} · vs {awayTeamFlag} {awayTeamName}</p>
            </div>
            <div className="space-y-3 mb-5">
              {TACTICS.map(t => {
                const selected = tactic.id === t.id;
                return (
                  <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => setTactic(t)}
                    className={`w-full text-left rounded-2xl border p-4 transition relative overflow-hidden ${
                      selected ? "border-green-400 bg-green-500/10" : "border-white/10 bg-white/5"
                    }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${t.color} opacity-10`} />
                    <div className="relative flex items-start gap-3">
                      <div className="text-2xl">{t.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {t.name} {selected && <span className="text-green-400">✓</span>}
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
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-2xl">← Composition</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => playHalf(1, tactic)}
                className="flex-2 bg-green-500 hover:bg-green-400 text-white font-black py-3 px-8 rounded-2xl">
                ⚽ Lancer !
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── MATCH EN COURS ── */}
        {(phase === "playing" || phase === "playing2") && (
          <div>
            {/* Palette modale régie */}
            {showPalette && (
              <PaletteTactique
                timelineEvents={matchModule?.MATCH_TIMELINE_EVENTS ?? []}
                formation={formation}
                onFormationChange={setFormation}
                onClose={() => setShowPalette(false)}
                awayFlag={awayTeamFlag}
                awayName={awayTeamName}
              />
            )}

            {/* ── Panneau PAUSE TACTIQUE ── */}
            {showPauseTactic && (
              <PauseTactiquePanel
                currentMin={currentMin}
                homeScore={homeScore}
                awayScore={awayScore}
                tactic={tactic}
                TACTICS={TACTICS}
                pendingTactic={pendingTactic}
                setPendingTactic={setPendingTactic}
                senegalPlayers={senegalPlayers}
                senegalBench={senegalBench}
                onResume={resumeMatch}
                onSubstitute={handleInMatchSubstitute}
                getLiveRating={getLiveRating}
                FormBadge={FormBadge}
              />
            )}

            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isPaused ? "text-yellow-400" : "text-green-400 animate-pulse"}`}>
                  {isPaused ? "⏸️" : "⏱️"}
                </span>
                <span className="text-white font-bold">{Math.min(currentMin, 90)}'</span>
                <span className="text-xs text-gray-400">{phase === "playing" ? "1ère" : "2e"} mi-temps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇸🇳</span>
                <span className="text-2xl font-black">{phase === "playing" ? 0 : homeScore}</span>
                <span className="text-gray-400">-</span>
                <span className="text-2xl font-black">{phase === "playing" ? 0 : awayScore}</span>
                <span className="text-xl">{awayTeamFlag}</span>
              </div>
              {/* Boutons Pause + Régie */}
              <div className="flex items-center gap-1">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={isPaused ? () => resumeMatch(null) : pauseMatch}
                  className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                    isPaused
                      ? "bg-green-500/20 border-green-400/30 text-green-400"
                      : "bg-yellow-500/20 border-yellow-400/30 text-yellow-400"
                  }`}>
                  {isPaused ? "▶" : "⏸"}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPalette(true)}
                  className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 text-xs font-bold px-2 py-1 rounded-lg">
                  📺
                </motion.button>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
              <motion.div animate={{ width: `${Math.min((currentMin / 90) * 100, 100)}%` }}
                transition={{ duration: 0.2 }} className="h-1.5 bg-green-400 rounded-full" />
            </div>
            <div className="mb-3">
              <MatchField events={visibleEvents} currentMin={currentMin} phase={phase}
                senScore={phase === "playing" ? 0 : homeScore}
                norScore={phase === "playing" ? 0 : awayScore}
                formation={formation}
                tacticId={tactic.id}
                awayFlag={awayTeamFlag}
                awayName={awayTeamName}
                awayPlayers={awayPlayers}
                activePlayers={senegalPlayers}
                timelineEvents={matchModule?.MATCH_TIMELINE_EVENTS ?? []} />
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {[...visibleEvents].reverse().map((event, i) => {
                  const isGoal = event.type === "goal";
                  const isSub  = event.type === "sub";
                  const isText = event.type === "text";
                  const action = (!isGoal && !isSub && !isText) ? KEY_ACTIONS[event.type] : null;
                  const isSen  = event.team === "me" || event.team === "sen";
                  return (
                    <motion.div key={`${event.minute}-${i}`}
                      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                      className={`px-4 py-2.5 rounded-xl border ${
                        isGoal ? (isSen ? "bg-green-500/20 border-green-400/30" : "bg-red-500/20 border-red-400/30")
                        : isText ? "bg-white/3 border-white/5"
                        : "bg-white/5 border-white/10"
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{isGoal ? "⚽" : isSub ? "🔄" : isText ? "💬" : (action?.emoji ?? "▸")}</span>
                        <span className="text-xs text-gray-400 font-mono w-8 shrink-0">{event.minute}'</span>
                        <span className={`text-sm font-bold flex-1 ${isSen ? "text-green-200" : "text-red-200"}`}>
                          {event.player || ""}
                        </span>
                        {!isText && !isSub && (
                          <span className="text-xs text-gray-400">
                            {isGoal ? (isSen ? `✅ 🇸🇳` : `❌ ${awayTeamFlag}`) : action?.label}
                          </span>
                        )}
                      </div>
                      {/* Description narrative — buts en blanc gras, autres en italique gris */}
                      {event.desc && (
                        <p className={`text-[11px] mt-1 ml-11 leading-relaxed ${
                          isGoal ? "text-white font-semibold" : "text-gray-400 italic"
                        }`}>
                          {event.desc}
                        </p>
                      )}
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

        {/* ── MI-TEMPS ── */}
        {phase === "halftime" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⏸️</div>
              <h2 className="text-2xl font-black">Mi-temps</h2>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-4 text-center">
              <div className="flex items-center justify-center gap-8">
                <div><div className="text-xs text-gray-400">🇸🇳 Sénégal</div><div className="text-5xl font-black">{homeScore}</div></div>
                <span className="text-2xl text-gray-400">-</span>
                <div><div className="text-xs text-gray-400">{awayTeamFlag} {awayTeamName}</div><div className="text-5xl font-black">{awayScore}</div></div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {homeScore > awayScore ? "🟢 Le Sénégal mène — continuez !" :
                 homeScore === awayScore ? "🟡 Nul — il faut marquer !" :
                 "🔴 Le Sénégal est mené — réagissez !"}
              </p>
            </div>
            <MatchRecap events={half1Events} title="📊 Récap — 1ère mi-temps" />
            <p className="text-xs text-gray-400 mb-3 text-center font-bold">Ajuste ta tactique :</p>
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

        {/* ── RÉSULTAT ── */}
        {phase === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-2xl p-6 text-center mb-4 border ${
              homeScore > awayScore ? "bg-green-500/20 border-green-400/40" :
              homeScore === awayScore ? "bg-yellow-500/20 border-yellow-400/40" :
              "bg-red-500/20 border-red-400/40"
            }`}>
              <div className="text-4xl mb-2">{homeScore > awayScore ? "🏆" : homeScore === awayScore ? "🤝" : "😔"}</div>
              <h2 className="text-lg font-black mb-1">Résultat simulé</h2>
              <p className="text-xs text-gray-400 mb-4">{tactic.emoji} {tactic.name} · {formation}</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl">🇸🇳</div>
                  <div className="text-xs text-gray-400 mb-1">Sénégal</div>
                  <div className="text-6xl font-black">{homeScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-4xl">{awayTeamFlag}</div>
                  <div className="text-xs text-gray-400 mb-1">{awayTeamName}</div>
                  <div className="text-6xl font-black">{awayScore}</div>
                </div>
              </div>
              <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2">
                <p className="text-yellow-400 font-bold text-sm">🎯 Score sauvegardé !</p>
                <p className="text-xs text-gray-400 mt-0.5">Si c'est le vrai résultat → 200 💰 bonus</p>
              </div>
            </div>

            <MatchRecap events={allEvents} title="📊 Récap complet du match" />

            {matchStats && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                <h3 className="font-bold text-white mb-3 text-sm">📈 Statistiques</h3>
                <div className="mb-2">
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
                  { label: "Tirs",   me: matchStats.shots.me,    ai: matchStats.shots.ai },
                  { label: "Cadrés", me: matchStats.onTarget.me, ai: matchStats.onTarget.ai },
                  { label: "xG",     me: matchStats.xG.me,       ai: matchStats.xG.ai },
                ].map(({ label, me, ai }) => {
                  const total = me + ai || 1;
                  return (
                    <div key={label} className="mb-1.5">
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
                  <span className="text-red-400">{awayTeamFlag} {awayTeamName}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={shareOnWhatsApp}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
                📲 Partager ma simulation sur WhatsApp
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { reset(); }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                🔄 Choisir un autre match
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
