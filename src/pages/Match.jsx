// src/pages/Match.jsx
// Match simulé — ton équipe vs IA, avec tactiques et mi-temps
// Toute la logique de calcul est dans src/data/match-engine.js

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { Link }                         from "react-router-dom";
import { useAuth }                      from "../hooks/useAuth";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import PlayerCard                        from "../components/PlayerCard";
import { getMatchupMultiplier, getDefaultRole } from "../data/player-roles";
import { rollMatchForm, FORM_STATES } from "../data/match-form";
import {
  TEAM_KEY, TACTICS, AI_TEAMS, KEY_ACTIONS,
  calcTeamStats, simulateHalfGoals, applyTactic, generateHalfEvents,
} from "../data/match-engine";

export default function MatchGame() {
  const { user }                    = useAuth();
  const { coins, lives, submitResult, refresh } = useGameStats();

  const [myTeam,        setMyTeam]        = useState([]);
  const [selectedAI,    setSelectedAI]    = useState(null);
  const [phase,         setPhase]         = useState("select"); // select | tactic | playing | halftime | playing2 | result
  const [tactic,        setTactic]        = useState(TACTICS[0]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [myScore,       setMyScore]       = useState(0);
  const [aiScore,       setAiScore]       = useState(0);
  const [currentMin,    setCurrentMin]    = useState(0);
  const [reward,        setReward]        = useState(0);
  const [allEvents,     setAllEvents]     = useState([]);
  const [myFormMap,     setMyFormMap]     = useState({});
  const [aiFormMap,     setAiFormMap]     = useState({});
  const intervalRef = useRef(null);

  // Charger mon équipe
  useEffect(() => {
    const team = (() => { try { return JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}; } catch { return {}; } })();
    const players = Object.values(team).filter(Boolean);
    setMyTeam(players);
  }, []);

  const myStats  = calcTeamStats(myTeam, selectedAI?.players ?? [], myFormMap);
  const myRating = calcTeamStats(myTeam).rating; // rating affiché reste neutre, sans bonus de matchup/forme

  function chooseOpponent(aiTeam) {
    // Assigner un rôle par défaut à chaque joueur IA pour activer les interactions croisées
    const aiWithRoles = {
      ...aiTeam,
      players: aiTeam.players.map(p => ({ ...p, role: getDefaultRole(p).id })),
    };
    setSelectedAI(aiWithRoles);
    setTactic(TACTICS[0]);
    // Tirer la forme du jour une seule fois, au moment du choix d'adversaire
    setMyFormMap(rollMatchForm(myTeam));
    setAiFormMap(rollMatchForm(aiWithRoles.players));
    setPhase("tactic");
  }

  function playHalf(half, currentTactic) {
    const aiStats = calcTeamStats(selectedAI.players, myTeam, aiFormMap);
    const myAdjusted = applyTactic(myStats, currentTactic);
    const aiAttack    = Math.round(aiStats.ATT * currentTactic.oppAttMult);

    const myGoals = simulateHalfGoals(myAdjusted.ATT, aiStats.DEF);
    const aiGoals = simulateHalfGoals(aiAttack, myAdjusted.DEF);

    const offset = half === 1 ? 0 : 45;
    const events  = generateHalfEvents(myGoals, aiGoals, myTeam, selectedAI.players, offset);

    setVisibleEvents([]);
    setCurrentMin(offset);
    setPhase(half === 1 ? "playing" : "playing2");

    let min = offset;
    const target = offset + 45;
    intervalRef.current = setInterval(() => {
      min += 1;
      setCurrentMin(Math.min(min, target));
      setVisibleEvents(events.filter(e => e.minute <= min));

      if (min >= target) {
        clearInterval(intervalRef.current);
        setTimeout(async () => {
          if (half === 1) {
            setMyScore(myGoals);
            setAiScore(aiGoals);
            setAllEvents(events);
            setPhase("halftime");
          } else {
            const finalMy = myScore + myGoals;
            const finalAi = aiScore + aiGoals;
            setMyScore(finalMy);
            setAiScore(finalAi);
            setAllEvents(prev => [...prev, ...events]);

            const won  = finalMy > finalAi;
            const draw = finalMy === finalAi;
            // Mapping vers la formule backend: pointsBase = correct*10 + fastAnswers*10 + bonus_streak
            // On veut 50/20/5 coins → correct = 5/2/0.5, donc on passe directement en "correct" arrondi
            // pour rester compatible avec le endpoint partagé avec le Quiz.
            const correctEquiv = won ? 5 : draw ? 2 : 1;
            const result = await submitResult({
              correct:     correctEquiv,
              wrong:       0,
              streak:      0,
              fastAnswers: 0,
              livesUsed:   1, // 1 vie consommée par match, déduite côté backend
            });
            await refresh();
            setReward(result?.coinsEarned ?? (won ? 50 : draw ? 20 : 5));
            setPhase("result");
          }
        }, 1000);
      }
    }, 600);
  }

  function startFirstHalf() {
    playHalf(1, tactic);
  }

  function startSecondHalf(newTactic) {
    setTactic(newTactic);
    playHalf(2, newTactic);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function resetMatch() {
    setPhase("select");
    setSelectedAI(null);
    setAllEvents([]);
    setVisibleEvents([]);
    setCurrentMin(0);
    setMyScore(0);
    setAiScore(0);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">⚽</div>
          <p className="text-gray-400 mb-4">Connecte-toi pour jouer</p>
          <Link to="/"><button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl">Se connecter</button></Link>
        </div>
      </div>
    );
  }

  if (myTeam.length < 5) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚽</div>
          <h2 className="text-xl font-bold mb-2">Équipe incomplète</h2>
          <p className="text-gray-400 mb-6">Tu as besoin d'au moins 5 joueurs dans ton équipe pour jouer un match !</p>
          <div className="flex gap-3 justify-center">
            <Link to="/team"><button className="bg-green-500 text-white font-bold px-5 py-3 rounded-xl">⚽ Mon équipe</button></Link>
            <Link to="/cards"><button className="bg-purple-500 text-white font-bold px-5 py-3 rounded-xl">🃏 Cartes</button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (lives <= 0 && phase === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-red-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-4">💔</div>
          <h1 className="text-2xl font-bold mb-2">Plus de vies !</h1>
          <p className="text-gray-400 mb-6">Tes vies se régénèrent automatiquement, ou achète-en au Shop.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/shop"><button className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl">🛒 Shop ({coins} 🪙)</button></Link>
            <Link to="/"><button className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl">← Retour</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-blue-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚽ Match</h1>
            <p className="text-xs text-gray-400">Note équipe : {myRating} · {myTeam.length} joueurs</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
            <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        {/* ── SÉLECTION ADVERSAIRE ─────────────────────────────────────── */}
        {phase === "select" && (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
              <h3 className="font-bold text-white mb-3">👥 Ton équipe</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {myTeam.slice(0, 6).map((p, i) => (
                  <div key={i} className="shrink-0">
                    <PlayerCard player={p} size="sm" animate={false} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-3 text-center">
                {[["⚔️ ATT", myStats.ATT], ["🎯 MIL", myStats.MIL], ["🛡️ DEF", myStats.DEF]].map(([label, val]) => (
                  <div key={label} className="flex-1 bg-white/5 rounded-xl py-2">
                    <div className="font-black text-yellow-400">{val}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="font-bold text-white mb-3">🎯 Choisis ton adversaire</h3>
            <div className="space-y-3">
              {AI_TEAMS.map((team, i) => {
                const diff      = myRating - team.rating;
                const difficulty = diff > 5 ? "Facile 🟢" : diff > -5 ? "Moyen 🟡" : "Difficile 🔴";
                const rewardEst = diff > 5 ? 30 : diff > -5 ? 50 : 90;

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative rounded-2xl border border-white/10 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${team.color} opacity-20`} />
                    <div className="relative flex items-center gap-4 p-4">
                      <div className="text-4xl">{team.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{team.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Note {team.rating} · {difficulty} · +{rewardEst} 💰 si victoire
                        </div>
                        <div className="flex gap-1 mt-1">
                          {team.players.map(p => (
                            <span key={p.id} className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
                              {p.flag} {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => chooseOpponent(team)}
                        className="bg-green-500 hover:bg-green-400 text-white font-bold px-4 py-2 rounded-xl shrink-0 transition">
                        Choisir
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CHOIX TACTIQUE AVANT MATCH ──────────────────────────────────── */}
        {phase === "tactic" && selectedAI && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-xl font-bold">Choisis ta tactique</h2>
              <p className="text-sm text-gray-400">Contre {selectedAI.emoji} {selectedAI.name} (note {selectedAI.rating})</p>
            </div>

            {/* Analyse des duels de rôles */}
            {(() => {
              const myPlayersWithRole = myTeam.filter(p => p.role);
              const matchupInfo = myPlayersWithRole
                .map(p => ({ player: p, mult: getMatchupMultiplier(p, selectedAI.players) }))
                .filter(m => m.mult !== 1);
              if (matchupInfo.length === 0) return null;
              return (
                <div className="mb-5 bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2 font-bold">⚔️ Duels de rôles détectés</p>
                  <div className="space-y-1.5">
                    {matchupInfo.map(({ player, mult }, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{player.name?.split(" ").pop()}</span>
                        <span className={mult > 1 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                          {mult > 1 ? "↑ Avantagé" : "↓ Contré"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Forme du jour — uniquement ton équipe, l'adversaire reste une inconnue */}
            {Object.keys(myFormMap).length > 0 && (
              <div className="mb-5 bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2 font-bold">📊 Forme du jour</p>
                <div className="space-y-1.5">
                  {myTeam.filter(p => myFormMap[p.id]).map((p, i) => {
                    const form = FORM_STATES[myFormMap[p.id]];
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{p.name?.split(" ").pop()}</span>
                        <span className={form.id === "on_fire" ? "text-orange-400 font-bold" : "text-blue-300 font-bold"}>
                          {form.emoji} {form.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3 mb-5">
              {TACTICS.map(t => {
                const isLocked = t.requiresPHY && myStats.PHY < 78;
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
                          {selected && <span className="text-green-400 text-xs">✓ Sélectionné</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
                        {isLocked && (
                          <div className="text-xs text-yellow-400 mt-1">
                            ⚠️ Ton équipe manque de PHY ({myStats.PHY}/78) — effet réduit
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={startFirstHalf}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              ⚽ Coup d'envoi !
            </motion.button>
          </motion.div>
        )}

        {/* ── MATCH EN COURS (1ère ou 2e mi-temps) ────────────────────────── */}
        {(phase === "playing" || phase === "playing2") && selectedAI && (
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center"
            >
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                ⏱️ {Math.min(currentMin, 90)}' · {phase === "playing" ? "1ère mi-temps" : "2e mi-temps"} · {tactic.emoji} {tactic.name}
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-xs text-gray-400 font-bold">{user.username}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black text-white">
                    {phase === "playing" ? "0" : myScore}
                  </span>
                  <span className="text-2xl text-gray-400">-</span>
                  <span className="text-5xl font-black text-white">
                    {phase === "playing" ? "0" : aiScore}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{selectedAI.emoji}</div>
                  <div className="text-xs text-gray-400 font-bold">{selectedAI.name}</div>
                </div>
              </div>

              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <motion.div
                  animate={{ width: `${Math.min(((currentMin) / 90) * 100, 100)}%` }}
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
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: event.team === "me" ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                        isGoal
                          ? event.team === "me"
                            ? "bg-green-500/20 border border-green-400/30"
                            : "bg-red-500/20 border border-red-400/30"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <span className="text-xl">{isGoal ? "⚽" : action.emoji}</span>
                      <span className="text-xs text-gray-400 font-bold w-8">{event.minute}'</span>
                      <span className={`text-sm font-bold ${isGoal ? "text-white" : "text-gray-300"}`}>{event.player}</span>
                      <span className="text-xs ml-auto">
                        {isGoal
                          ? (event.team === "me" ? "✅ But pour toi !" : "❌ But adverse")
                          : action.label}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {visibleEvents.length === 0 && (
                <div className="text-center text-gray-400 py-8 animate-pulse">
                  ⚽ Match en cours...
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAUSE MI-TEMPS ──────────────────────────────────────────────── */}
        {phase === "halftime" && selectedAI && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">⏸️</div>
              <h2 className="text-2xl font-black text-white">Mi-temps</h2>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400 font-bold">{user.username}</div>
                  <div className="text-5xl font-black text-white">{myScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-xs text-gray-400 font-bold">{selectedAI.name}</div>
                  <div className="text-5xl font-black text-white">{aiScore}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-400">
                {myScore > aiScore ? "🟢 Tu mènes — garde le rythme !" :
                 myScore === aiScore ? "🟡 Match nul — c'est le moment d'oser" :
                 "🔴 Tu es mené — change de stratégie pour la 2e mi-temps !"}
              </div>
            </div>

            <h3 className="font-bold text-white mb-3 text-center">🔄 Ajuste ta tactique pour la 2e mi-temps</h3>
            <div className="space-y-3 mb-5">
              {TACTICS.map(t => {
                const isLocked = t.requiresPHY && myStats.PHY < 78;
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
                          {selected && <span className="text-green-400 text-xs">✓ Sélectionné</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
                        {isLocked && (
                          <div className="text-xs text-yellow-400 mt-1">
                            ⚠️ Ton équipe manque de PHY ({myStats.PHY}/78) — effet réduit
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => startSecondHalf(tactic)}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              ⚽ Reprise du match !
            </motion.button>
          </motion.div>
        )}

        {/* ── RÉSULTAT ─────────────────────────────────────────────────── */}
        {phase === "result" && selectedAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={`rounded-2xl p-6 text-center mb-5 border ${
              myScore > aiScore
                ? "bg-green-500/20 border-green-400/40"
                : myScore === aiScore
                  ? "bg-yellow-500/20 border-yellow-400/40"
                  : "bg-red-500/20 border-red-400/40"
            }`}>
              <div className="text-5xl mb-2">
                {myScore > aiScore ? "🏆" : myScore === aiScore ? "🤝" : "😔"}
              </div>
              <h2 className="text-2xl font-black text-white mb-1">
                {myScore > aiScore ? "Victoire !" : myScore === aiScore ? "Match nul !" : "Défaite..."}
              </h2>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400">{user.username}</div>
                  <div className="text-5xl font-black text-white">{myScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-xs text-gray-400">{selectedAI.name}</div>
                  <div className="text-5xl font-black text-white">{aiScore}</div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2"
              >
                <span className="text-yellow-400 font-black text-lg">+{reward} 💰</span>
                <span className="text-gray-300 text-sm ml-2">coins gagnés !</span>
              </motion.div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
              <h3 className="font-bold text-white mb-3">📋 Résumé du match</h3>
              <div className="space-y-2">
                {allEvents.filter(e => e.type === "goal").map((event, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm ${
                    event.team === "me" ? "text-green-300" : "text-red-300"
                  }`}>
                    <span className="w-8 text-xs text-gray-400">{event.minute}'</span>
                    <span>⚽</span>
                    <span className="font-bold">{event.player}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {event.team === "me" ? user.username : selectedAI.name}
                    </span>
                  </div>
                ))}
                {allEvents.filter(e => e.type === "goal").length === 0 && (
                  <p className="text-gray-400 text-sm text-center">0-0 · Aucun but</p>
                )}
                {allEvents.filter(e => e.type !== "goal").length > 0 && (
                  <p className="text-xs text-gray-500 text-center pt-2 border-t border-white/5 mt-2">
                    + {allEvents.filter(e => e.type !== "goal").length} autres actions clés pendant le match
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={resetMatch}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
                🔄 Rejouer
              </motion.button>
              <Link to="/challenge">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-2xl transition">
                  🆚 Défier un ami
                </motion.button>
              </Link>
              <Link to="/team">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                  ⚽ Améliorer mon équipe
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
