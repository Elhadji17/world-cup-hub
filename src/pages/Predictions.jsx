import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATCHES, FLAGS, getUpcomingMatches } from "../data/matches";
import { AI_PREDICTIONS, getConfidenceColor, getConfidenceBg } from "../data/aiPredictions";
import { calculatePoints, getOutcome, agreesWithAI, getMedal } from "../utils/scoring";

// ─── Récupère / sauvegarde les pronostics dans localStorage ───────────────────
const STORAGE_KEY = "wch_predictions";
const JOKER_KEY   = "wch_joker";

function loadPredictions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function savePredictions(preds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preds));
}
function loadJoker() {
  return localStorage.getItem(JOKER_KEY) || null;
}
function saveJoker(matchId) {
  localStorage.setItem(JOKER_KEY, String(matchId));
}

// ─── Sous-composant : carte d'un match ────────────────────────────────────────
function MatchCard({ match, prediction, isJoker, onSave, onJoker }) {
  const ai = AI_PREDICTIONS[match.id];
  const [scoreA, setScoreA] = useState(prediction?.scoreA ?? "");
  const [scoreB, setScoreB] = useState(prediction?.scoreB ?? "");
  const [saved, setSaved]   = useState(!!prediction);

  const hasInput = scoreA !== "" && scoreB !== "";
  const userPred = hasInput ? { scoreA: Number(scoreA), scoreB: Number(scoreB) } : null;

  const sameAsAI = userPred && ai
    ? agreesWithAI(userPred, { scoreA: ai.scoreA, scoreB: ai.scoreB })
    : false;

  function handleSave() {
    if (!hasInput) return;
    onSave(match.id, { scoreA: Number(scoreA), scoreB: Number(scoreB) });
    setSaved(true);
  }

  function handleEdit() {
    setSaved(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border transition-all
        ${isJoker ? "border-yellow-400 shadow-yellow-400/30 shadow-lg" : "border-white/10"}`}
    >
      {/* Badge joker */}
      {isJoker && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
          ⭐ JOKER ×2
        </div>
      )}

      {/* Groupe + stade */}
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>Groupe {match.group}</span>
        <span>📍 {match.stadium}</span>
        <span>🕒 {match.date} {match.time}</span>
      </div>

      {/* Équipes */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <div className="text-3xl mb-1">{FLAGS[match.teamA] || "🏳️"}</div>
          <div className="font-bold text-sm">{match.teamA}</div>
        </div>

        {/* Score saisi */}
        <div className="flex items-center gap-2 mx-3">
          {saved ? (
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className="bg-white/20 rounded-lg px-3 py-1">{scoreA}</span>
              <span className="text-gray-400">–</span>
              <span className="bg-white/20 rounded-lg px-3 py-1">{scoreB}</span>
            </div>
          ) : (
            <>
              <input
                type="number" min="0" max="20" value={scoreA}
                onChange={e => setScoreA(e.target.value)}
                className="w-12 text-center text-xl font-bold bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400"
                placeholder="0"
              />
              <span className="text-gray-400 text-lg">–</span>
              <input
                type="number" min="0" max="20" value={scoreB}
                onChange={e => setScoreB(e.target.value)}
                className="w-12 text-center text-xl font-bold bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400"
                placeholder="0"
              />
            </>
          )}
        </div>

        <div className="text-center flex-1">
          <div className="text-3xl mb-1">{FLAGS[match.teamB] || "🏳️"}</div>
          <div className="font-bold text-sm">{match.teamB}</div>
        </div>
      </div>

      {/* Prédiction IA */}
      {ai && (
        <div className="bg-black/30 rounded-xl p-3 mb-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-purple-300 font-bold">🤖 IA prédit :</span>
            <span className="text-white font-bold">
              {ai.scoreA} – {ai.scoreB}
              <span className="ml-2 text-gray-300">({ai.winner === "Draw" ? "Nul" : ai.winner})</span>
            </span>
            <span className={`font-bold ${getConfidenceColor(ai.confidence)}`}>
              {ai.confidence}%
            </span>
          </div>
          {/* Barre de confiance */}
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${getConfidenceBg(ai.confidence)}`}
              style={{ width: `${ai.confidence}%` }}
            />
          </div>
          <p className="text-gray-400 mt-1 leading-relaxed">{ai.reasoning}</p>
          {userPred && (
            <div className={`mt-1 font-semibold ${sameAsAI ? "text-green-400" : "text-orange-400"}`}>
              {sameAsAI ? "✅ Tu es d'accord avec l'IA" : "⚡ Tu défies l'IA !"}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!saved ? (
          <button
            onClick={handleSave}
            disabled={!hasInput}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-bold py-2 px-4 rounded-xl transition active:scale-95"
          >
            Valider mon pronostic
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl transition active:scale-95"
          >
            ✏️ Modifier
          </button>
        )}

        <button
          onClick={() => onJoker(match.id)}
          title={isJoker ? "Joker actif sur ce match" : "Utiliser mon joker ici (×2 points)"}
          className={`px-3 py-2 rounded-xl font-bold transition active:scale-95 text-lg
            ${isJoker
              ? "bg-yellow-400 text-black"
              : "bg-white/10 hover:bg-yellow-400/20 text-yellow-400"
            }`}
        >
          ⭐
        </button>
      </div>

      {/* Partage WhatsApp (si sauvegardé) */}
      {saved && (
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `⚽ Mon pronostic sur World Cup Hub 2026 :\n${FLAGS[match.teamA]} ${match.teamA} ${scoreA} – ${scoreB} ${match.teamB} ${FLAGS[match.teamB]}${isJoker ? " ⭐ JOKER" : ""}\nGroupe ${match.group} · ${match.date}\n🔥 https://world-cup-hub-kappa.vercel.app/`
          )}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-2 text-xs text-green-400 hover:text-green-300 transition"
        >
          📲 Partager sur WhatsApp
        </a>
      )}
    </motion.div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function Predictions() {
  const [predictions, setPredictions] = useState(loadPredictions);
  const [jokerMatchId, setJokerMatchId] = useState(() => {
    const stored = loadJoker();
    return stored ? Number(stored) : null;
  });
  const [activeGroup, setActiveGroup] = useState("ALL");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const playerName = localStorage.getItem("playerName") || "Joueur";

  // Filtrer les matchs selon le groupe actif
  const displayedMatches = useMemo(() => {
    if (activeGroup === "ALL") return getUpcomingMatches(12);
    return MATCHES.filter(m => m.group === activeGroup);
  }, [activeGroup]);

  function handleSavePrediction(matchId, scores) {
    const updated = { ...predictions, [matchId]: scores };
    setPredictions(updated);
    savePredictions(updated);
  }

  function handleSetJoker(matchId) {
    const newJoker = jokerMatchId === matchId ? null : matchId;
    setJokerMatchId(newJoker);
    if (newJoker) saveJoker(newJoker);
    else localStorage.removeItem(JOKER_KEY);
  }

  // Calcul du score total estimé (sur les matchs déjà sauvegardés)
  const savedCount = Object.keys(predictions).length;
  const totalPossiblePoints = savedCount * 15;

  const medal = getMedal(savedCount * 8); // estimation

  const groups = ["ALL", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-black to-purple-900 text-white pb-16">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🔮 Pronostics</h1>
            <p className="text-xs text-gray-400">
              {savedCount} pronostic{savedCount > 1 ? "s" : ""} enregistré{savedCount > 1 ? "s" : ""}
              {jokerMatchId ? " · ⭐ Joker posé" : " · ⭐ Joker disponible"}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-400">{medal.emoji} {playerName}</div>
              <div className="text-xs text-gray-400">{medal.label}</div>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-sm font-bold transition"
            >
              🏆
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* INFO JOKER */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4 mb-4 text-sm">
          <p className="font-bold text-yellow-300 mb-1">⭐ Règle du Joker</p>
          <p className="text-gray-300">
            Utilise le bouton ⭐ sur le match où tu es <strong>le plus confiant</strong>.
            Si ton pronostic est correct, tu obtiens <strong>le double des points</strong> !
            Tu peux changer ton joker à tout moment avant le coup d'envoi.
          </p>
        </div>

        {/* LÉGENDE POINTS */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
          <div className="bg-white/10 rounded-xl py-2 px-1">
            <div className="text-green-400 font-bold text-lg">15 pts</div>
            <div className="text-gray-400">Score exact</div>
          </div>
          <div className="bg-white/10 rounded-xl py-2 px-1">
            <div className="text-blue-400 font-bold text-lg">7-12 pts</div>
            <div className="text-gray-400">Bon résultat</div>
          </div>
          <div className="bg-white/10 rounded-xl py-2 px-1">
            <div className="text-orange-400 font-bold text-lg">2 pts</div>
            <div className="text-gray-400">Score proche</div>
          </div>
        </div>

        {/* FILTRES GROUPES */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition
                ${activeGroup === g
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
            >
              {g === "ALL" ? "À venir" : `Gr. ${g}`}
            </button>
          ))}
        </div>

        {/* LEADERBOARD LOCAL */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <h2 className="font-bold mb-3 text-lg">🏆 Ton tableau de bord</h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-400">{savedCount}</div>
                    <div className="text-xs text-gray-400">Pronostics</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-2xl font-bold text-yellow-400">{jokerMatchId ? 1 : 0}</div>
                    <div className="text-xs text-gray-400">Joker posé</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-2xl font-bold text-green-400">
                      {Object.entries(predictions).filter(([id]) =>
                        agreesWithAI(predictions[id], AI_PREDICTIONS[id] ? { scoreA: AI_PREDICTIONS[id].scoreA, scoreB: AI_PREDICTIONS[id].scoreB } : predictions[id])
                      ).length}
                    </div>
                    <div className="text-xs text-gray-400">Avec l'IA</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Le classement multijoueur sera disponible avec le backend 🚀
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTE DES MATCHS */}
        <div className="grid gap-4">
          <AnimatePresence>
            {displayedMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions[match.id] || null}
                isJoker={jokerMatchId === match.id}
                onSave={handleSavePrediction}
                onJoker={handleSetJoker}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Message si aucun match */}
        {displayedMatches.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">📭</div>
            <p>Aucun match dans ce groupe pour l'instant.</p>
          </div>
        )}

      </div>
    </div>
  );
}