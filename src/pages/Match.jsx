// src/pages/Match.jsx
// Match simulé — ton équipe vs IA

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { Link }                         from "react-router-dom";
import { useAuth }                      from "../hooks/useAuth";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import PlayerCard                        from "../components/PlayerCard";

const TEAM_KEY       = "wch_team";
const COLLECTION_KEY = "wch_cards";

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

// Calculer les stats moyennes d'une équipe
function calcTeamStats(players) {
  if (!players || players.length === 0) return { ATT: 50, MIL: 50, DEF: 50, rating: 50 };
  const total = players.length;
  const avg   = key => Math.round(players.reduce((s, p) => s + (p.stats?.[key] ?? 60), 0) / total);
  return {
    ATT:    Math.round((avg("TIR") + avg("PAC") + avg("DRI")) / 3),
    MIL:    Math.round((avg("PAS") + avg("DRI")) / 2),
    DEF:    Math.round((avg("DEF") + avg("PHY")) / 2),
    rating: Math.round(players.reduce((s, p) => s + (p.rating ?? 70), 0) / total),
  };
}

// Simuler le score d'une équipe
function simulateGoals(attackStrength, defenseStrength) {
  const diff    = (attackStrength - defenseStrength) / 20;
  const base    = Math.max(0, diff + (Math.random() * 2 - 0.5));
  return Math.round(Math.min(base, 6));
}

// Générer les événements du match
function generateEvents(myGoals, aiGoals, myPlayers, aiPlayers) {
  const events = [];
  const minutes = new Set();

  const addEvent = (type, team, player, minute) => {
    while (minutes.has(minute)) minute = Math.min(90, minute + 1);
    minutes.add(minute);
    events.push({ type, team, player, minute });
  };

  // Buts de mon équipe
  const attackers = myPlayers.filter(p => p.position === "ATT" || p.position === "MIL");
  for (let i = 0; i < myGoals; i++) {
    const scorer = attackers[Math.floor(Math.random() * Math.max(attackers.length, 1))];
    addEvent("goal", "me", scorer?.name?.split(" ").pop() ?? "Joueur", Math.floor(Math.random() * 85) + 1);
  }

  // Buts adverses
  for (let i = 0; i < aiGoals; i++) {
    const scorer = aiPlayers[Math.floor(Math.random() * Math.max(aiPlayers.length, 1))];
    addEvent("goal", "ai", scorer?.name ?? "Adversaire", Math.floor(Math.random() * 85) + 1);
  }

  return events.sort((a, b) => a.minute - b.minute);
}

export default function MatchGame() {
  const { user }           = useAuth();
  const { coins, buyItem, refresh } = useGameStats();

  const [myTeam,      setMyTeam]      = useState([]);
  const [selectedAI,  setSelectedAI]  = useState(null);
  const [phase,       setPhase]       = useState("select"); // select | playing | result
  const [events,      setEvents]      = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [myScore,     setMyScore]     = useState(0);
  const [aiScore,     setAiScore]     = useState(0);
  const [currentMin,  setCurrentMin]  = useState(0);
  const [reward,      setReward]      = useState(0);
  const intervalRef = useRef(null);

  // Charger mon équipe
  useEffect(() => {
    const team = (() => { try { return JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}; } catch { return {}; } })();
    const collection = (() => { try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; } catch { return []; } })();
    const players = Object.values(team).filter(Boolean);
    setMyTeam(players);
  }, []);

  const myStats = calcTeamStats(myTeam);
  const myRating = myStats.rating;

  function startMatch(aiTeam) {
    setSelectedAI(aiTeam);
    const aiStats = calcTeamStats(aiTeam.players);

    // Simuler les buts
    const myGoals = simulateGoals(myStats.ATT, aiStats.DEF);
    const aiGoals = simulateGoals(aiStats.ATT, myStats.DEF);

    const matchEvents = generateEvents(myGoals, aiGoals, myTeam, aiTeam.players);
    setEvents(matchEvents);
    setMyScore(myGoals);
    setAiScore(aiGoals);
    setVisibleEvents([]);
    setCurrentMin(0);
    setPhase("playing");

    // Animer le match minute par minute
    let min = 0;
    intervalRef.current = setInterval(() => {
      min += 3;
      setCurrentMin(min);

      // Révéler les événements au fur et à mesure
      const newEvents = matchEvents.filter(e => e.minute <= min);
      setVisibleEvents(newEvents);

      if (min >= 90) {
        clearInterval(intervalRef.current);
        setTimeout(async () => {
          // Calculer la récompense
          const won  = myGoals > aiGoals;
          const draw = myGoals === aiGoals;
          const coins = won ? 100 : draw ? 40 : 15;
          setReward(coins);
          setPhase("result");
          // Créditer les coins via backend
          const token = localStorage.getItem("wch_token");
          if (token) {
            await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/quiz?action=submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({
                correct: won ? coinsWon / 10 : draw ? 4 : 1,
                wrong: 0, streak: 0, fastAnswers: 0, livesUsed: 0,
              }),
            });
            await refresh(); // Rafraîchir les coins dans le context
          }
        }, 1000);
      }
    }, 200);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function resetMatch() {
    setPhase("select");
    setSelectedAI(null);
    setEvents([]);
    setVisibleEvents([]);
    setCurrentMin(0);
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
            {/* Mon équipe */}
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

            {/* Choisir adversaire */}
            <h3 className="font-bold text-white mb-3">🎯 Choisis ton adversaire</h3>
            <div className="space-y-3">
              {AI_TEAMS.map((team, i) => {
                const diff      = myRating - team.rating;
                const difficulty = diff > 5 ? "Facile 🟢" : diff > -5 ? "Moyen 🟡" : "Difficile 🔴";
                const reward    = diff > 5 ? 50 : diff > -5 ? 100 : 200;

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative rounded-2xl border border-white/10 overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${team.color} opacity-20`} />
                    <div className="relative flex items-center gap-4 p-4">
                      <div className="text-4xl">{team.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{team.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Note {team.rating} · {difficulty} · +{reward} 💰 si victoire
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
                        onClick={() => startMatch(team)}
                        className="bg-green-500 hover:bg-green-400 text-white font-bold px-4 py-2 rounded-xl shrink-0 transition">
                        Jouer
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MATCH EN COURS ───────────────────────────────────────────── */}
        {phase === "playing" && selectedAI && (
          <div>
            {/* Tableau de score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center"
            >
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                ⏱️ {Math.min(currentMin, 90)}'
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-xs text-gray-400 font-bold">{user.username}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black text-white">{myScore}</span>
                  <span className="text-2xl text-gray-400">-</span>
                  <span className="text-5xl font-black text-white">{aiScore}</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{selectedAI.emoji}</div>
                  <div className="text-xs text-gray-400 font-bold">{selectedAI.name}</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <motion.div
                  animate={{ width: `${Math.min(currentMin / 90 * 100, 100)}%` }}
                  transition={{ duration: 0.2 }}
                  className="h-2 bg-green-400 rounded-full"
                />
              </div>
            </motion.div>

            {/* Événements du match */}
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

        {/* ── RÉSULTAT ─────────────────────────────────────────────────── */}
        {phase === "result" && selectedAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Résultat final */}
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

              {/* Récompense */}
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

            {/* Événements résumé */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
              <h3 className="font-bold text-white mb-3">📋 Résumé du match</h3>
              <div className="space-y-2">
                {events.map((event, i) => (
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
                {events.length === 0 && (
                  <p className="text-gray-400 text-sm text-center">0-0 · Aucun but</p>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={resetMatch}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
                🔄 Rejouer
              </motion.button>
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
