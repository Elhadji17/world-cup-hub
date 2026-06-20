// src/pages/Match.jsx
// Match simulé — ton équipe vs IA, avec tactiques et mi-temps

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { Link }                         from "react-router-dom";
import { useAuth }                      from "../hooks/useAuth";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import PlayerCard                        from "../components/PlayerCard";
import { applyRoleBoost }                from "../data/player-roles";

const TEAM_KEY       = "wch_team";

// ── Tactiques ────────────────────────────────────────────────────────────
const TACTICS = [
  {
    id:    "balanced",
    name:  "Formation équilibrée",
    emoji: "⚖️",
    desc:  "Aucun bonus ni malus — un style solide en toutes circonstances",
    attMult: 1.0, defMult: 1.0, oppAttMult: 1.0,
    color: "from-blue-600 to-blue-800",
  },
  {
    id:    "attack",
    name:  "Attaque totale",
    emoji: "🔥",
    desc:  "+25% d'attaque mais -20% de défense — tout pour marquer",
    attMult: 1.25, defMult: 0.8, oppAttMult: 1.1,
    color: "from-red-600 to-orange-700",
  },
  {
    id:    "press",
    name:  "Pressing haut",
    emoji: "⚡",
    desc:  "+15% attaque et défense si ton équipe est physique, sinon ça fatigue",
    attMult: 1.15, defMult: 1.1, oppAttMult: 1.0,
    color: "from-yellow-500 to-amber-700",
    requiresPHY: true,
  },
  {
    id:    "defense",
    name:  "Défense solide",
    emoji: "🛡️",
    desc:  "+25% défense mais -20% attaque — bloquer puis contre-attaquer",
    attMult: 0.8, defMult: 1.25, oppAttMult: 0.85,
    color: "from-gray-600 to-gray-800",
  },
];

// Équipes IA adverses
const AI_TEAMS = [
  {
    name:   "Les Étoiles du Monde",
    emoji:  "🌍",
    rating: 82,
    color:  "from-blue-700 to-blue-900",
    players: [
      { id: "ai1", name: "Rodriguez",  rating: 84, stats: { PAC: 82, TIR: 85, PAS: 78, DRI: 80, DEF: 45, PHY: 82 }, rarity: "silver", flag: "🇧🇷", position: "ATT" },
      { id: "ai2", name: "Mueller",    rating: 80, stats: { PAC: 75, TIR: 82, PAS: 80, DRI: 78, DEF: 50, PHY: 78 }, rarity: "silver", flag: "🇩🇪", position: "MIL" },
      { id: "ai3", name: "Hernandez",  rating: 83, stats: { PAC: 88, TIR: 80, PAS: 75, DRI: 85, DEF: 40, PHY: 75 }, rarity: "silver", flag: "🇲🇽", position: "ATT" },
    ],
  },
  {
    name:   "Dream Team Africa",
    emoji:  "🌍",
    rating: 79,
    color:  "from-green-700 to-green-900",
    players: [
      { id: "ai4", name: "Diallo",    rating: 78, stats: { PAC: 90, TIR: 75, PAS: 72, DRI: 82, DEF: 42, PHY: 80 }, rarity: "bronze", flag: "🇸🇳", position: "ATT" },
      { id: "ai5", name: "Konaté",    rating: 80, stats: { PAC: 75, TIR: 55, PAS: 68, DRI: 65, DEF: 88, PHY: 90 }, rarity: "silver", flag: "🇫🇷", position: "DEF" },
      { id: "ai6", name: "Traoré",    rating: 79, stats: { PAC: 85, TIR: 78, PAS: 70, DRI: 84, DEF: 38, PHY: 74 }, rarity: "bronze", flag: "🇨🇮", position: "ATT" },
    ],
  },
  {
    name:   "Champions d'Europe",
    emoji:  "🏆",
    rating: 87,
    color:  "from-purple-700 to-purple-900",
    players: [
      { id: "ai7", name: "Silva",     rating: 88, stats: { PAC: 72, TIR: 60, PAS: 75, DRI: 70, DEF: 92, PHY: 90 }, rarity: "gold", flag: "🇵🇹", position: "DEF" },
      { id: "ai8", name: "Kroos",     rating: 87, stats: { PAC: 68, TIR: 80, PAS: 95, DRI: 82, DEF: 70, PHY: 72 }, rarity: "gold", flag: "🇩🇪", position: "MIL" },
      { id: "ai9", name: "Benzema",   rating: 90, stats: { PAC: 78, TIR: 92, PAS: 82, DRI: 88, DEF: 38, PHY: 82 }, rarity: "gold", flag: "🇫🇷", position: "ATT" },
    ],
  },
  {
    name:   "Légendes Mondiales",
    emoji:  "💎",
    rating: 93,
    color:  "from-yellow-600 to-amber-800",
    players: [
      { id: "ai10", name: "El Maestro",  rating: 95, stats: { PAC: 88, TIR: 96, PAS: 95, DRI: 98, DEF: 42, PHY: 72 }, rarity: "legendary", flag: "🇦🇷", position: "ATT" },
      { id: "ai11", name: "CR Legacy",   rating: 94, stats: { PAC: 90, TIR: 96, PAS: 82, DRI: 93, DEF: 36, PHY: 92 }, rarity: "legendary", flag: "🇵🇹", position: "ATT" },
      { id: "ai12", name: "The Kaiser",  rating: 90, stats: { PAC: 75, TIR: 65, PAS: 80, DRI: 75, DEF: 95, PHY: 92 }, rarity: "gold",      flag: "🇩🇪", position: "DEF" },
    ],
  },
];

// Calculer les stats moyennes d'une équipe — applique les boosts de rôle si présents
function calcTeamStats(players) {
  if (!players || players.length === 0) return { ATT: 50, MIL: 50, DEF: 50, PHY: 50, rating: 50 };
  const total = players.length;
  const effectiveStats = key => players.reduce((s, p) => {
    const stats = p.role ? applyRoleBoost(p, p.role) : (p.stats ?? {});
    return s + (stats[key] ?? 60);
  }, 0) / total;
  const avg = key => Math.round(effectiveStats(key));
  return {
    ATT:    Math.round((avg("TIR") + avg("PAC") + avg("DRI")) / 3),
    MIL:    Math.round((avg("PAS") + avg("DRI")) / 2),
    DEF:    Math.round((avg("DEF") + avg("PHY")) / 2),
    PHY:    avg("PHY"),
    rating: Math.round(players.reduce((s, p) => s + (p.rating ?? 70), 0) / total),
  };
}

// Simuler le score d'une demi (45 min) avec tactique appliquée
function simulateHalfGoals(attackStrength, defenseStrength) {
  const diff = (attackStrength - defenseStrength) / 28;
  const base = Math.max(0, diff + (Math.random() * 1.3 - 0.3));
  return Math.round(Math.min(base, 4));
}

// Appliquer une tactique aux stats d'équipe
function applyTactic(stats, tactic) {
  let attMult = tactic.attMult;
  if (tactic.requiresPHY && stats.PHY < 78) {
    attMult = 0.95;
  }
  return {
    ATT: Math.round(stats.ATT * attMult),
    DEF: Math.round(stats.DEF * tactic.defMult),
  };
}

// Générer les événements d'une demi
function generateHalfEvents(myGoals, aiGoals, myPlayers, aiPlayers, minuteOffset) {
  const events = [];
  const minutes = new Set();

  const addEvent = (team, player, minute) => {
    while (minutes.has(minute)) minute = Math.min(minuteOffset + 45, minute + 1);
    minutes.add(minute);
    events.push({ team, player, minute });
  };

  const attackers = myPlayers.filter(p => p.position === "ATT" || p.position === "MIL");
  for (let i = 0; i < myGoals; i++) {
    const scorer = attackers[Math.floor(Math.random() * Math.max(attackers.length, 1))];
    addEvent("me", scorer?.name?.split(" ").pop() ?? "Joueur", minuteOffset + Math.floor(Math.random() * 43) + 1);
  }
  for (let i = 0; i < aiGoals; i++) {
    const scorer = aiPlayers[Math.floor(Math.random() * Math.max(aiPlayers.length, 1))];
    addEvent("ai", scorer?.name ?? "Adversaire", minuteOffset + Math.floor(Math.random() * 43) + 1);
  }

  return events.sort((a, b) => a.minute - b.minute);
}

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
  const intervalRef = useRef(null);

  // Charger mon équipe
  useEffect(() => {
    const team = (() => { try { return JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}; } catch { return {}; } })();
    const players = Object.values(team).filter(Boolean);
    setMyTeam(players);
  }, []);

  const myStats  = calcTeamStats(myTeam);
  const myRating = myStats.rating;

  function chooseOpponent(aiTeam) {
    setSelectedAI(aiTeam);
    setTactic(TACTICS[0]);
    setPhase("tactic");
  }

  function playHalf(half, currentTactic) {
    const aiStats = calcTeamStats(selectedAI.players);
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
      min += 3;
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
    }, 200);
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
                {visibleEvents.map((event, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: event.team === "me" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                      event.team === "me"
                        ? "bg-green-500/20 border border-green-400/30"
                        : "bg-red-500/20 border border-red-400/30"
                    }`}
                  >
                    <span className="text-xl">⚽</span>
                    <span className="text-xs text-gray-400 font-bold w-8">{event.minute}'</span>
                    <span className="text-sm font-bold text-white">{event.player}</span>
                    <span className="text-xs ml-auto">
                      {event.team === "me" ? "✅ But pour toi !" : "❌ But adverse"}
                    </span>
                  </motion.div>
                ))}
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
                {allEvents.map((event, i) => (
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
                {allEvents.length === 0 && (
                  <p className="text-gray-400 text-sm text-center">0-0 · Aucun but</p>
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
