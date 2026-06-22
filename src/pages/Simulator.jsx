// src/pages/Simulator.jsx
// Simulateur Tactique — Sénégal vs Norvège · Coupe du Monde 2026

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useGameStats }                 from "../hooks/useGameStats.jsx";
import { TACTICS, generateHalfEvents, mergeMatchStats, calcTeamStats, applyTactic, KEY_ACTIONS } from "../data/match-engine";
import { SENEGAL_MATCH, NORWAY_MATCH, getScriptedEventsForHalf } from "../data/matchData";
import { getRecentFormMultiplier }      from "../data/match-form";
import MatchField                        from "../components/MatchField";

function getLiveRating(player) {
  const mult = getRecentFormMultiplier(player);
  return Math.round(player.rating * mult * 10) / 10;
}

const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "5-3-2"];

// ── Récap des actions d'une mi-temps ou du match complet ─────────────────
function MatchRecap({ events, title }) {
  if (!events || events.length === 0) return null;

  const goals   = events.filter(e => e.type === "goal");
  const shots   = events.filter(e => e.type === "shot" || e.type === "miss" || e.type === "save" || e.type === "header" || e.type === "goal");
  const senGoals = goals.filter(e => e.team === "me").length;
  const norGoals = goals.filter(e => e.team === "ai").length;
  const corners  = events.filter(e => e.type === "corner").length;
  const yellows  = events.filter(e => e.type === "yellow").length;
  const saves    = events.filter(e => e.type === "save").length;
  const misses   = events.filter(e => e.type === "miss").length;
  const headers  = events.filter(e => e.type === "header").length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
      <h3 className="font-bold text-white mb-3 text-sm">{title}</h3>

      {/* Buts */}
      {goals.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">⚽ Buts</p>
          {goals.map((g, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs mb-1 ${g.team === "me" ? "text-green-300" : "text-red-300"}`}>
              <span className="font-mono text-gray-400 w-8">{g.minute}'</span>
              <span>⚽</span>
              <span className="font-bold">{g.player}</span>
              <span className="ml-auto">{g.team === "me" ? "🇸🇳" : "🇳🇴"}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Tirs/têtes", value: shots.length, emoji: "🎯" },
          { label: "Parades", value: saves, emoji: "🧤" },
          { label: "Occasions ratées", value: misses, emoji: "😬" },
          { label: "Corners", value: corners, emoji: "🚩" },
          { label: "Cartons jaunes", value: yellows, emoji: "🟨" },
          { label: "Duels aériens", value: headers, emoji: "🤯" },
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

function FormBadge({ player }) {
  if (!player) return null;
  const mult = getRecentFormMultiplier(player);
  if (mult >= 1.05) return <span className="text-[9px] text-orange-400 font-bold">🔥</span>;
  if (mult <= 0.95) return <span className="text-[9px] text-blue-400 font-bold">😴</span>;
  return null;
}

export default function Simulator() {
  const { coins } = useGameStats();

  const [senegalPlayers, setSenegalPlayers] = useState(SENEGAL_MATCH.players);
  const [senegalBench,   setSenegalBench]   = useState(SENEGAL_MATCH.bench);
  const [formation,      setFormation]      = useState(SENEGAL_MATCH.formation);
  const [tactic,         setTactic]         = useState(TACTICS[0]);
  const [subTarget,      setSubTarget]      = useState(null);

  const [phase,         setPhase]         = useState("lineup");
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [homeScore,     setHomeScore]     = useState(0);
  const [awayScore,     setAwayScore]     = useState(0);
  const [currentMin,    setCurrentMin]    = useState(0);
  const [allEvents,     setAllEvents]     = useState([]);
  const [half1Events,   setHalf1Events]   = useState([]);
  const [matchStats,    setMatchStats]    = useState(null);
  const intervalRef = useRef(null);

  const norwayPlayers = NORWAY_MATCH.players;
  const norwayTactic  = TACTICS[2];

  function handleSubstitute(benchPlayer) {
    if (!subTarget) return;
    setSenegalPlayers(prev => prev.map(p => p.id === subTarget.id ? benchPlayer : p));
    setSenegalBench(prev => prev.map(p => p.id === benchPlayer.id ? subTarget : p));
    setSubTarget(null);
  }

  // Dans src/pages/Simulator.jsx -> Fonction playHalf()

// Dans src/pages/Simulator.jsx

// Dans Simulator_3.jsx

function playHalf(half, currentTactic) {
  const offset = half === 1 ? 0 : 45;

  // 1. Récupération des événements scriptés mis à jour (On passe la formation en paramètre)
  const scripted = getScriptedEventsForHalf(half, currentTactic.id, senegalPlayers, formation).map(e => ({
    team: e.team,
    player: e.player,
    minute: e.minute,
    type: e.type,
    scripted: true, 
    desc: e.desc,
    rawStats: e.rawStats
  }));

  let scriptedSenGoals = scripted.filter(e => e.team === "sen" && e.type === "goal").length;
  let scriptedNorGoals = scripted.filter(e => e.team === "nor" && e.type === "goal").length;

  let bonusSenGoals = 0;

  // ─── 🔥 ENRICHISSEMENT 2E MI-TEMPS : COACHING & BUT DE LA VICTOIRE ───
  if (half === 2) {
    // A. Injection d'un Changement Tactique Scénarisé automatique à la 80e minute
    const subIn = senegalBench[0]?.name || "Iliman Ndiaye";
    const subOut = senegalPlayers.find(p => p.position === "MIL" && p.name !== "L. Camara")?.name || "I. Gueye";

    scripted.push({
      team: "sen",
      player: subIn,
      minute: 80,
      type: "corner", // Représente une phase de jeu gagnée
      scripted: true,
      desc: `🔄 CHANGEMENT TACTIQUE : Le coach fait entrer ${subIn} à la place de ${subOut} pour amener de la créativité entre les lignes et exploiter la fatigue des défenseurs norvégiens.`,
      rawStats: { senegal: { tirs: 0 } }
    });

    // B. Forçage du but de la victoire héroïque (2-1) à la 88e minute
    const totalCurrentSen = homeScore + scriptedSenGoals;
    const totalCurrentNor = awayScore + scriptedNorGoals;

    if (totalCurrentSen <= totalCurrentNor) {
      bonusSenGoals = (totalCurrentNor - totalCurrentSen) + 1;
      scriptedSenGoals += bonusSenGoals;

      const starAttacker = senegalPlayers.find(p => p.position === "ATT")?.name || "Sadio Mané";
      
      scripted.push({
        team: "sen",
        player: starAttacker,
        minute: 88,
        type: "goal",
        scripted: true,
        desc: `BUT EXCEPTIONNEL À LA 88e MINUTE !!! Le stade explose ! ${subIn}, à peine entré, élimine Berge et glisse le cuir à ${starAttacker}. Notre ailier enchaîne d'une frappe enveloppée en pleine lucarne ! Le plan en ${formation} s'avère payant !`,
        rawStats: { senegal: { tirs: 1, cadres: 1, xg: 0.55 }, norvege: {} }
      });
    }
  }

  const finalSenGoals = scriptedSenGoals;
  const finalNorGoals = scriptedNorGoals;

  // ─── 📊 ACCUMULATEUR DE STATISTIQUES REHAUSSÉ POUR PLUS DE VOLUME ───
  let tirsSen = 0, cadresSen = 0, xgSen = 0, jaunesSen = 0, cornersSen = 3;
  let tirsNor = 0, cadresNor = 0, xgNor = 0, jaunesNor = 0, cornersNor = 2;

  scripted.forEach(e => {
    if (e.rawStats?.senegal) {
      tirsSen += e.rawStats.senegal.tirs || 0;
      cadresSen += e.rawStats.senegal.cadres || 0;
      xgSen += e.rawStats.senegal.xg || 0;
      jaunesSen += e.rawStats.senegal.jaunes || 0;
    }
    if (e.rawStats?.norvege) {
      tirsNor += e.rawStats.norvege.tirs || 0;
      cadresNor += e.rawStats.norvege.cadres || 0;
      xgNor += e.rawStats.norvege.xg || 0;
      jaunesNor += e.rawStats.norvege.jaunes || 0;
    }
  });

  // Rehaussement du volume d'actions globales pour combler les blancs de l'affichage
  if (tirsSen <= finalSenGoals) tirsSen += finalSenGoals + Math.floor(Math.random() * 4) + 4;
  if (cadresSen <= finalSenGoals) cadresSen = finalSenGoals + Math.floor(Math.random() * 3) + 1;
  if (xgSen <= finalSenGoals) xgSen = Number((cadresSen * 0.22 + finalSenGoals * 0.40).toFixed(2));

  if (tirsNor <= finalNorGoals) tirsNor += finalNorGoals + Math.floor(Math.random() * 3) + 3;
  if (cadresNor <= finalNorGoals) cadresNor = finalNorGoals + Math.floor(Math.random() * 2) + 1;
  if (xgNor <= finalNorGoals) xgNor = Number((cadresNor * 0.20 + finalNorGoals * 0.45).toFixed(2));

  // Dans Simulator_3.jsx -> À l'intérieur de playHalf()

// ── MODIFICATEUR DE STATS SELON LA FORMATION ACCORDÉE ──
let basePossession = 50;
let possessionBonusSen = 0;
let extraShotsSen = 0;
let extraShotsNor = 0;

if (["4-3-3", "4-2-3-1"].includes(formation)) {
  // Ultra Offensif : Gros tirs pour les deux (car contres concédés)
  possessionBonusSen = 4; 
  extraShotsSen = 4;
  extraShotsNor = 3;
} else if (["5-3-2", "5-4-1"].includes(formation)) {
  // Ultra Défensif : Faible possession, bloque les tirs adverses
  possessionBonusSen = -8; 
  extraShotsSen = 1;
  extraShotsNor = -2; // On étouffe les tirs de la Norvège
} else if (["3-5-2"].includes(formation)) {
  // Maîtrise du milieu : Énorme possession
  possessionBonusSen = 8;
  extraShotsSen = 2;
  extraShotsNor = -1;
}

const finalPossessionSen = (half === 1 ? 52 : 50) + possessionBonusSen;

const halfStats = {
  senegal: { 
    possession: finalPossessionSen, 
    tirs: tirsSen + Math.max(0, extraShotsSen), 
    cadres: cadresSen + Math.floor(extraShotsSen / 2), 
    xg: Number((xgSen + (extraShotsSen * 0.1)).toFixed(2)), 
    corners: cornersSen + (half * 2), 
    jaunes: jaunesSen || 1 
  },
  norvege: { 
    possession: 100 - finalPossessionSen, 
    tirs: Math.max(2, tirsNor + extraShotsNor), 
    cadres: Math.max(1, cadresNor + Math.floor(extraShotsNor / 2)), 
    xg: Number((xgNor + (extraShotsNor * 0.08)).toFixed(2)), 
    corners: Math.max(1, cornersNor + extraShotsNor), 
    jaunes: jaunesNor || 1 
  }
};

  // ─── ⏱️ LANCEUR D'INTERVALLE ADAPTÉ (PLUS DE TEMPS DE LECTURE) ───
  setVisibleEvents([]);
  setCurrentMin(offset);
  setPhase(half === 1 ? "playing" : "playing2");

  let min = offset;
  // Tri final des événements par minute pour éviter les télescopages chronologiques
  const sortedHalfEvents = scripted.sort((a, b) => a.minute - b.minute);

  intervalRef.current = setInterval(() => {
    min += 1;
    setCurrentMin(Math.min(min, offset + 45));
    setVisibleEvents(sortedHalfEvents.filter(e => e.minute <= min));

    if (min >= offset + 45) {
      clearInterval(intervalRef.current);
      setTimeout(() => {
        if (half === 1) {
          setHomeScore(finalSenGoals);
          setAwayScore(finalNorGoals);
          setAllEvents(sortedHalfEvents);
          setHalf1Events(sortedHalfEvents);
          
          setMatchStats({
            possession: { me: halfStats.senegal.possession, ai: halfStats.norvege.possession },
            shots:      { me: halfStats.senegal.tirs,       ai: halfStats.norvege.tirs },
            onTarget:   { me: halfStats.senegal.cadres,     ai: halfStats.norvege.cadres },
            xG:         { me: halfStats.senegal.xg,         ai: halfStats.norvege.xg }
          });
          
          setPhase("halftime");
        } else {
          const finalHome = homeScore + finalSenGoals;
          const finalAway = awayScore + finalNorGoals;
          setHomeScore(finalHome);
          setAwayScore(finalAway);
          setAllEvents(prev => [...prev, ...sortedHalfEvents]);
          
          setMatchStats(prev => {
            const prevPosMe = prev?.possession?.me || 52;
            const prevPosAi = prev?.possession?.ai || 48;
            return {
              possession: { me: Math.round((prevPosMe + halfStats.senegal.possession) / 2), ai: Math.round((prevPosAi + halfStats.norvege.possession) / 2) },
              shots:      { me: (prev?.shots?.me || 0) + halfStats.senegal.tirs,       ai: (prev?.shots?.ai || 0) + halfStats.norvege.tirs },
              onTarget:   { me: (prev?.onTarget?.me || 0) + halfStats.senegal.cadres,   ai: (prev?.onTarget?.ai || 0) + halfStats.norvege.cadres },
              xG:         { me: Number(((prev?.xG?.me || 0) + halfStats.senegal.xg).toFixed(2)), ai: Number(((prev?.xG?.ai || 0) + halfStats.norvege.xg).toFixed(2)) }
            };
          });
          
          setPhase("result");
        }
      }, 1000);
    }
  }, 550); // Fluidité augmentée à 550ms pour laisser vivre les blocs de texte !
}

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function reset() {
    setSenegalPlayers(SENEGAL_MATCH.players);
    setSenegalBench(SENEGAL_MATCH.bench);
    setFormation(SENEGAL_MATCH.formation);
    setTactic(TACTICS[0]);
    setPhase("lineup");
    setAllEvents([]);
    setHalf1Events([]);
    setVisibleEvents([]);
    setMatchStats(null);
    setHomeScore(0);
    setAwayScore(0);
  }

  function shareOnWhatsApp() {
    const text = `⚽ J'ai simulé Sénégal 🇸🇳 vs Norvège 🇳🇴 sur World Cup Hub !\n\n🎯 Ma tactique : ${tactic.emoji} ${tactic.name} · Formation : ${formation}\n📊 Résultat simulé : ${homeScore}-${awayScore}\n\nSimule toi aussi 👉 worldcuphub2026.vercel.app/simulator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
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

        {/* ── COMPOSITION ─────────────────────────────────────────────── */}
        {phase === "lineup" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-4 mb-5">
              <p className="text-xs text-red-300 font-bold mb-1">🚨 Contexte</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Sénégal dos au mur après 3-1 contre la France. Norvège en confiance avec 4-1 contre l'Irak (Haaland ⚠️). C'est un match de survie !
              </p>
            </div>

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

            <div className="mb-5 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">🇳🇴 Norvège (4-3-3)</p>
              <div className="space-y-1">
                {["GK","DEF","MIL","ATT"].map(pos => (
                  <div key={pos} className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-gray-500 font-bold w-6">{pos}</span>
                    {norwayPlayers.filter(p => p.position === pos).map(p => (
                      <span key={p.id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                        #{p.number} {p.name}{p.ratingBase >= 88 ? " ★" : ""}
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
              <p className="text-sm text-gray-400">Formation : {formation} · Adversaire : Pressing haut ⚡</p>
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
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-2xl">← Composition</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => playHalf(1, tactic)}
                className="flex-2 bg-green-500 hover:bg-green-400 text-white font-black py-3 px-8 rounded-2xl">
                ⚽ Lancer !
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── MATCH EN COURS ───────────────────────────────────────────── */}
        {(phase === "playing" || phase === "playing2") && (
          <div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold animate-pulse">⏱️</span>
                <span className="text-white font-bold">{Math.min(currentMin, 90)}'</span>
                <span className="text-xs text-gray-400">{phase === "playing" ? "1ère" : "2e"} mi-temps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇸🇳</span>
                <span className="text-2xl font-black">{phase === "playing" ? 0 : homeScore}</span>
                <span className="text-gray-400">-</span>
                <span className="text-2xl font-black">{phase === "playing" ? 0 : awayScore}</span>
                <span className="text-xl">🇳🇴</span>
              </div>
              <span className="text-xs text-gray-400">{tactic.emoji}</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
              <motion.div animate={{ width: `${Math.min((currentMin / 90) * 100, 100)}%` }}
                transition={{ duration: 0.2 }} className="h-1.5 bg-green-400 rounded-full" />
            </div>

            <div className="mb-3">
              <MatchField events={visibleEvents} currentMin={currentMin} phase={phase}
                senScore={phase === "playing" ? 0 : homeScore}
                norScore={phase === "playing" ? 0 : awayScore} />
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {[...visibleEvents].reverse().map((event, i) => {
                  const isGoal = event.type === "goal";
                  const action = !isGoal ? KEY_ACTIONS[event.type] : null;
                  const isSen  = event.team === "me" || event.team === "sen";
                  return (
                    <motion.div key={`${event.minute}-${i}`}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className={`px-4 py-2.5 rounded-xl border ${
                        isGoal
                          ? isSen ? "bg-green-500/20 border-green-400/30" : "bg-red-500/20 border-red-400/30"
                          : "bg-white/5 border-white/10"
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{isGoal ? "⚽" : action?.emoji}</span>
                        <span className="text-xs text-gray-400 font-mono w-8 shrink-0">{event.minute}'</span>
                        <span className={`text-sm font-bold flex-1 ${isSen ? "text-green-200" : "text-red-200"}`}>
                          {event.player}
                        </span>
                        <span className="text-xs text-gray-400">
                          {isGoal ? (isSen ? "✅ But 🇸🇳" : "❌ But 🇳🇴") : action?.label}
                        </span>
                      </div>
                      {/* Description narrative pour les événements scénarisés */}
                      {event.scripted && event.desc && (
                        <p className="text-[11px] text-gray-400 mt-1 ml-11 italic">{event.desc}</p>
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

        {/* ── MI-TEMPS ─────────────────────────────────────────────────── */}
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
                <div><div className="text-xs text-gray-400">🇳🇴 Norvège</div><div className="text-5xl font-black">{awayScore}</div></div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {homeScore > awayScore ? "🟢 Le Sénégal mène — continuez !" :
                 homeScore === awayScore ? "🟡 Nul — un but peut tout changer" :
                 "🔴 Le Sénégal est mené — il faut réagir !"}
              </p>
            </div>

            {/* Récap des actions de la 1ère mi-temps */}
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

        {/* ── RÉSULTAT ─────────────────────────────────────────────────── */}
        {phase === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-2xl p-6 text-center mb-4 border ${
              homeScore > awayScore ? "bg-green-500/20 border-green-400/40" :
              homeScore === awayScore ? "bg-yellow-500/20 border-yellow-400/40" :
              "bg-red-500/20 border-red-400/40"
            }`}>
              <div className="text-4xl mb-2">
                {homeScore > awayScore ? "🏆" : homeScore === awayScore ? "🤝" : "😔"}
              </div>
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
                  <div className="text-4xl">🇳🇴</div>
                  <div className="text-xs text-gray-400 mb-1">Norvège</div>
                  <div className="text-6xl font-black">{awayScore}</div>
                </div>
              </div>
              <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2">
                <p className="text-yellow-400 font-bold text-sm">🎯 Score sauvegardé !</p>
                <p className="text-xs text-gray-400 mt-0.5">Si c'est le vrai résultat ce soir → 200 💰 bonus</p>
              </div>
            </div>

            {/* Récap complet du match */}
            <MatchRecap events={allEvents} title="📊 Récap complet du match" />

            {/* Stats possession */}
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
                  { label: "Tirs", me: matchStats.shots.me, ai: matchStats.shots.ai },
                  { label: "Cadrés", me: matchStats.onTarget.me, ai: matchStats.onTarget.ai },
                  { label: "xG", me: matchStats.xG.me, ai: matchStats.xG.ai },
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
                  <span className="text-red-400">🇳🇴 Norvège</span>
                </div>
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
