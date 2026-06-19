// src/pages/Challenge.jsx
// Défi entre joueurs — créer un défi ou accepter celui d'un ami

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useParams, Link }              from "react-router-dom";
import { useAuth }                      from "../hooks/useAuth";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import PlayerCard                        from "../components/PlayerCard";

const API      = import.meta.env.VITE_API_URL ?? "";
const TEAM_KEY = "wch_team";

function loadTeam() {
  try { return Object.values(JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}).filter(Boolean); }
  catch { return []; }
}

function calcRating(players) {
  if (!players.length) return 0;
  return Math.round(players.reduce((s, p) => s + (p?.rating ?? 70), 0) / players.length);
}

function simGoals(atk, def) {
  const diff = (atk - def) / 20;
  return Math.max(0, Math.round(Math.min(diff + (Math.random() * 2 - 0.5), 6)));
}

export default function Challenge() {
  const { challengeId }  = useParams();
  const { user }         = useAuth();
  const { coins }        = useGameStats();

  const [myTeam,      setMyTeam]      = useState([]);
  const [phase,       setPhase]       = useState("loading"); // loading | create | share | accept | playing | result
  const [challenge,   setChallenge]   = useState(null);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [events,      setEvents]      = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [currentMin,  setCurrentMin]  = useState(0);
  const [myScore,     setMyScore]     = useState(0);
  const [oppScore,    setOppScore]    = useState(0);
  const intervalRef = useRef(null);

  const myRating = calcRating(myTeam);

  useEffect(() => {
    const team = loadTeam();
    setMyTeam(team);

    if (challengeId) {
      // Mode accepter un défi
      fetchChallenge(challengeId);
    } else {
      // Mode créer un défi
      setPhase(team.length >= 5 ? "create" : "no-team");
    }
  }, [challengeId]);

  async function fetchChallenge(id) {
    try {
      const res  = await fetch(`${API}/api/quiz?action=challenge-get&id=${id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); setPhase("error"); return; }
      setChallenge(data.challenge);
      setPhase("accept");
    } catch {
      setError("Erreur de connexion.");
      setPhase("error");
    }
  }

  async function createChallenge() {
    const token = localStorage.getItem("wch_token");
    if (!token) { setError("Connecte-toi pour créer un défi."); return; }

    try {
      const res  = await fetch(`${API}/api/quiz?action=challenge-create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ team: myTeam, rating: myRating }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setChallenge({ challengeId: data.challengeId });
      setPhase("share");
    } catch {
      setError("Erreur de connexion.");
    }
  }

  function startMatch(challengerTeam, opponentTeam, opponentName) {
    const cRating = calcRating(challengerTeam);
    const oRating = calcRating(opponentTeam);

    const cGoals = simGoals(cRating, oRating);
    const oGoals = simGoals(oRating, cRating);

    // Générer événements
    const evts = [];
    const mins = new Set();
    const addEvt = (team, player, min) => {
      while (mins.has(min)) min = Math.min(90, min + 1);
      mins.add(min);
      evts.push({ team, player, minute: min });
    };

    const cAttackers = challengerTeam.filter(p => p.position === "ATT" || p.position === "MIL");
    const oAttackers = opponentTeam.filter(p => p.position === "ATT" || p.position === "MIL");

    for (let i = 0; i < cGoals; i++) {
      const scorer = cAttackers[Math.floor(Math.random() * Math.max(cAttackers.length, 1))];
      addEvt("challenger", scorer?.name?.split(" ").pop() ?? "Joueur", Math.floor(Math.random() * 85) + 1);
    }
    for (let i = 0; i < oGoals; i++) {
      const scorer = oAttackers[Math.floor(Math.random() * Math.max(oAttackers.length, 1))];
      addEvt("opponent", scorer?.name?.split(" ").pop() ?? "Adversaire", Math.floor(Math.random() * 85) + 1);
    }

    evts.sort((a, b) => a.minute - b.minute);
    setEvents(evts);
    setMyScore(cGoals);
    setOppScore(oGoals);
    setCurrentMin(0);
    setVisibleEvents([]);
    setPhase("playing");

    let min = 0;
    intervalRef.current = setInterval(() => {
      min += 3;
      setCurrentMin(min);
      setVisibleEvents(evts.filter(e => e.minute <= min));
      if (min >= 90) {
        clearInterval(intervalRef.current);
        const winner = cGoals > oGoals ? "challenger" : oGoals > cGoals ? "opponent" : "draw";
        setTimeout(() => {
          setResult({ challengerScore: cGoals, opponentScore: oGoals, winner, opponentName });
          setPhase("result");
        }, 1000);
      }
    }, 150);
  }

  async function acceptChallenge() {
    if (!challenge) return;
    const opponentTeam   = myTeam;
    const opponentName   = user?.username ?? "Adversaire";
    const opponentRating = myRating;

    try {
      await fetch(`${API}/api/quiz?action=challenge-accept`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id: challenge.challengeId,
          opponentName,
          opponentTeam,
          opponentRating,
        }),
      });
    } catch {}

    startMatch(challenge.challengerTeam, opponentTeam, opponentName);
  }

  function copyLink() {
    const url = `${window.location.origin}/challenge/${challenge.challengeId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const url  = `${window.location.origin}/challenge/${challenge.challengeId}`;
    const text = `⚽ ${user?.username ?? "Un joueur"} te défie sur World Cup Hub 2026 !\nMon équipe a une note de ${myRating} — tu penses pouvoir battre ça ?\n👉 ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ── Renders ───────────────────────────────────────────────────────────────

  if (phase === "loading") return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">⚽</div>
        <p className="text-gray-400">Chargement...</p>
      </div>
    </div>
  );

  if (phase === "no-team") return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚽</div>
        <h2 className="text-xl font-bold mb-2">Équipe incomplète</h2>
        <p className="text-gray-400 mb-6">Tu as besoin d'au moins 5 joueurs pour défier quelqu'un !</p>
        <div className="flex gap-3 justify-center">
          <Link to="/team"><button className="bg-green-500 text-white font-bold px-5 py-3 rounded-xl">⚽ Mon équipe</button></Link>
          <Link to="/cards"><button className="bg-purple-500 text-white font-bold px-5 py-3 rounded-xl">🃏 Cartes</button></Link>
        </div>
      </div>
    </div>
  );

  if (phase === "error") return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-red-400 mb-4">{error ?? "Défi introuvable ou expiré."}</p>
        <Link to="/"><button className="bg-white/10 text-white font-bold px-5 py-3 rounded-xl">← Accueil</button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-blue-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🆚 Défi</h1>
          <div className="text-xs text-gray-400">Note équipe : {myRating}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        {/* ── CRÉER UN DÉFI ────────────────────────────────────────────────── */}
        {phase === "create" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🆚</div>
              <h2 className="text-2xl font-bold text-white mb-1">Défie un ami !</h2>
              <p className="text-gray-400 text-sm">Ton équipe (note {myRating}) affronte celle de ton ami</p>
            </div>

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
                {[["⚔️ ATT", Math.round(myTeam.filter(p=>p.position==="ATT").reduce((s,p)=>s+(p.rating??70),0)/Math.max(myTeam.filter(p=>p.position==="ATT").length,1))],
                  ["🛡️ DEF", Math.round(myTeam.filter(p=>p.position==="DEF").reduce((s,p)=>s+(p.rating??70),0)/Math.max(myTeam.filter(p=>p.position==="DEF").length,1))],
                  ["⭐ NOTE", myRating]].map(([label, val]) => (
                  <div key={label} className="flex-1 bg-white/5 rounded-xl py-2">
                    <div className="font-black text-yellow-400">{val || "—"}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

            <motion.button whileTap={{ scale: 0.97 }} onClick={createChallenge}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
              🆚 Créer mon défi
            </motion.button>
          </motion.div>
        )}

        {/* ── PARTAGER ──────────────────────────────────────────────────────── */}
        {phase === "share" && challenge && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h2 className="text-2xl font-bold mb-1">Défi créé !</h2>
            <p className="text-gray-400 text-sm mb-6">Partage le lien avec ton ami</p>

            {/* Code du défi */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-5">
              <p className="text-xs text-gray-400 mb-2">Code du défi</p>
              <div className="text-4xl font-black text-yellow-400 tracking-widest">
                {challenge.challengeId}
              </div>
              <p className="text-xs text-gray-500 mt-2">Valable 7 jours</p>
            </div>

            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={shareWhatsApp}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
                📲 Partager sur WhatsApp
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }} onClick={copyLink}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                {copied ? "✅ Lien copié !" : "🔗 Copier le lien"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── ACCEPTER UN DÉFI ──────────────────────────────────────────────── */}
        {phase === "accept" && challenge && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🆚</div>
              <h2 className="text-2xl font-bold mb-1">Tu as été défié !</h2>
              <p className="text-gray-400 text-sm">
                <span className="text-yellow-400 font-bold">{challenge.challenger}</span> te défie !
              </p>
            </div>

            {/* VS */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-yellow-400">{challenge.challengerRating}</div>
                <div className="text-sm font-bold text-white">{challenge.challenger}</div>
                <div className="text-xs text-gray-400">{challenge.challengerTeam?.length ?? 0} joueurs</div>
              </div>
              <div className="text-3xl font-black text-gray-400">VS</div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400">{myRating}</div>
                <div className="text-sm font-bold text-white">{user?.username ?? "Toi"}</div>
                <div className="text-xs text-gray-400">{myTeam.length} joueurs</div>
              </div>
            </div>

            {myTeam.length < 5 ? (
              <div className="text-center py-4">
                <p className="text-red-400 mb-3">Tu as besoin d'au moins 5 joueurs !</p>
                <Link to="/team">
                  <button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl">
                    ⚽ Compléter mon équipe
                  </button>
                </Link>
              </div>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={acceptChallenge}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition">
                ⚔️ Accepter le défi !
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ── MATCH EN COURS ────────────────────────────────────────────────── */}
        {phase === "playing" && (
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-5 text-center">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                ⏱️ {Math.min(currentMin, 90)}'
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">{challenge?.challenger ?? user?.username}</div>
                  <div className="text-5xl font-black text-white">{myScore}</div>
                </div>
                <div className="text-2xl text-gray-400">-</div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">{challenge ? (user?.username ?? "Toi") : "Adversaire"}</div>
                  <div className="text-5xl font-black text-white">{oppScore}</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <motion.div
                  animate={{ width: `${Math.min(currentMin / 90 * 100, 100)}%` }}
                  className="h-2 bg-green-400 rounded-full" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <AnimatePresence>
                {visibleEvents.map((evt, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: evt.team === "challenger" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                      evt.team === "challenger"
                        ? "bg-green-500/20 border border-green-400/30"
                        : "bg-red-500/20 border border-red-400/30"
                    }`}>
                    <span className="text-xl">⚽</span>
                    <span className="text-xs text-gray-400 font-bold w-8">{evt.minute}'</span>
                    <span className="text-sm font-bold">{evt.player}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {visibleEvents.length === 0 && (
                <p className="text-center text-gray-400 py-8 animate-pulse">⚽ Match en cours...</p>
              )}
            </div>
          </div>
        )}

        {/* ── RÉSULTAT ──────────────────────────────────────────────────────── */}
        {phase === "result" && result && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-2xl p-6 text-center mb-5 border ${
              result.winner === "challenger"
                ? "bg-green-500/20 border-green-400/40"
                : result.winner === "draw"
                  ? "bg-yellow-500/20 border-yellow-400/40"
                  : "bg-red-500/20 border-red-400/40"
            }`}>
              <div className="text-5xl mb-2">
                {result.winner === "challenger" ? "🏆" : result.winner === "draw" ? "🤝" : "😔"}
              </div>
              <h2 className="text-2xl font-black mb-3">
                {result.winner === "draw" ? "Match nul !" :
                 result.winner === "challenger" ? `${challenge?.challenger ?? user?.username} gagne !` :
                 `${result.opponentName ?? "Adversaire"} gagne !`}
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-gray-400">{challenge?.challenger ?? user?.username}</div>
                  <div className="text-5xl font-black text-white">{result.challengerScore}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-xs text-gray-400">{result.opponentName ?? "Adversaire"}</div>
                  <div className="text-5xl font-black text-white">{result.opponentScore}</div>
                </div>
              </div>
            </div>

            {/* Événements résumé */}
            {events.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <h3 className="font-bold text-white mb-3">📋 Résumé</h3>
                <div className="space-y-2">
                  {events.map((evt, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm ${
                      evt.team === "challenger" ? "text-green-300" : "text-red-300"
                    }`}>
                      <span className="w-8 text-xs text-gray-400">{evt.minute}'</span>
                      <span>⚽</span>
                      <span className="font-bold">{evt.player}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setPhase("create"); setResult(null); setEvents([]); }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
                🔄 Nouveau défi
              </motion.button>
              <Link to="/match">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                  🤖 Jouer contre l'IA
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
