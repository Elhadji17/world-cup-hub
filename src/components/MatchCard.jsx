// src/components/MatchCard.jsx
// Heure locale par stade + points obtenus + verrouillage

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FLAGS } from "../data/matches";
import { AI_PREDICTIONS, getConfidenceColor, getConfidenceBg } from "../data/aiPredictions";
import { agreesWithAI } from "../utils/scoring";
import {
  getMatchStatus, isMatchEditable,
  formatLocalTime, formatLocalDate, timeUntilMatch
} from "../utils/dateUtils";

export default function MatchCard({ match, prediction, isJoker, onSave, onJoker, result }) {
  const ai       = AI_PREDICTIONS[match.id];
  const status   = getMatchStatus(match.date, match.time, match.stadium);
  const editable = isMatchEditable(match.date, match.time, match.stadium);
  const countdown = timeUntilMatch(match.date, match.time, match.stadium);

  const [scoreA, setScoreA] = useState(prediction?.scoreA ?? "");
  const [scoreB, setScoreB] = useState(prediction?.scoreB ?? "");
  const [saved,  setSaved]  = useState(!!prediction);

  const hasInput = scoreA !== "" && scoreB !== "";
  const userPred = hasInput
    ? { scoreA: Number(scoreA), scoreB: Number(scoreB) }
    : null;

  const sameAsAI = userPred && ai
    ? agreesWithAI(userPred, { scoreA: ai.scoreA, scoreB: ai.scoreB })
    : false;

  // Points obtenus (depuis MongoDB via prop result)
  const points = prediction?.points ?? null;

  function handleSave() {
    if (!hasInput || !editable) return;
    onSave(match.id, { scoreA: Number(scoreA), scoreB: Number(scoreB) });
    setSaved(true);
  }

  function handleEdit() {
    if (!editable) return;
    setSaved(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative backdrop-blur-md rounded-2xl p-5 border transition-all ${
        isJoker
          ? "bg-yellow-900/30 border-yellow-400 shadow-yellow-400/30 shadow-lg"
          : status === "live"
            ? "bg-red-900/20 border-red-500/40"
            : status === "finished"
              ? "bg-white/5 border-white/10"
              : "bg-white/10 border-white/10"
      }`}
    >
      {/* Badge joker */}
      {isJoker && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow">
          ⭐ JOKER ×2
        </div>
      )}

      {/* Badge LIVE */}
      {status === "live" && (
        <div className="absolute -top-3 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
          🔴 LIVE
        </div>
      )}

      {/* Badge points obtenus */}
      {points !== null && points !== undefined && (
        <div className={`absolute -top-3 right-4 text-xs font-bold px-3 py-1 rounded-full shadow ${
          points >= 15 ? "bg-green-500 text-white"
          : points >= 7 ? "bg-blue-500 text-white"
          : points > 0  ? "bg-orange-500 text-white"
          : "bg-gray-600 text-gray-300"
        }`}>
          {points > 0 ? `+${points} pts` : "0 pt"}
        </div>
      )}

      {/* En-tête — heure locale du stade */}
      <div className="flex justify-between text-xs text-gray-400 mb-3 flex-wrap gap-1">
        <span className="bg-white/10 px-2 py-0.5 rounded-full">Groupe {match.group}</span>
        <span>
          🕒 {formatLocalDate(match.date, match.time, match.stadium)}
          {" · "}
          {formatLocalTime(match.date, match.time, match.stadium)}
          {countdown && <span className="ml-1 text-blue-300">({countdown})</span>}
        </span>
        <span>📍 {match.stadium}</span>
      </div>

      {/* Équipes + saisie score */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <div className="text-3xl mb-1">{FLAGS[match.teamA] ?? "🏳️"}</div>
          <div className="font-bold text-sm leading-tight">{match.teamA}</div>
        </div>

        <div className="flex items-center gap-2 mx-3">
          {saved || !editable ? (
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className={`rounded-lg px-3 py-1 ${editable ? "bg-white/20" : "bg-white/10 text-gray-400"}`}>
                {scoreA !== "" ? scoreA : "–"}
              </span>
              <span className="text-gray-400">–</span>
              <span className={`rounded-lg px-3 py-1 ${editable ? "bg-white/20" : "bg-white/10 text-gray-400"}`}>
                {scoreB !== "" ? scoreB : "–"}
              </span>
            </div>
          ) : (
            <>
              <input
                type="number" min="0" max="20"
                value={scoreA}
                onChange={e => setScoreA(e.target.value)}
                className="w-12 text-center text-xl font-bold bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400 transition"
                placeholder="0"
              />
              <span className="text-gray-400 text-lg">–</span>
              <input
                type="number" min="0" max="20"
                value={scoreB}
                onChange={e => setScoreB(e.target.value)}
                className="w-12 text-center text-xl font-bold bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400 transition"
                placeholder="0"
              />
            </>
          )}
        </div>

        <div className="text-center flex-1">
          <div className="text-3xl mb-1">{FLAGS[match.teamB] ?? "🏳️"}</div>
          <div className="font-bold text-sm leading-tight">{match.teamB}</div>
        </div>
      </div>

      {/* Score réel si disponible */}
      {result && (
        <div className="text-center text-sm font-bold text-green-300 mb-2">
          ✅ Score final : {result.realScoreA} – {result.realScoreB}
        </div>
      )}

      {/* Breakdown des points */}
      {prediction?.breakdown && (
        <div className="text-center text-xs text-gray-400 mb-3">
          {prediction.breakdown}
        </div>
      )}

      {/* Message blocage */}
      {!editable && (
        <div className={`text-center text-xs mb-3 font-semibold ${
          status === "live" ? "text-red-300" : "text-gray-500"
        }`}>
          {status === "live"
            ? "🔴 Match en cours — pronostic verrouillé"
            : "🔒 Match terminé — pronostic verrouillé"
          }
        </div>
      )}

      {/* Prédiction IA */}
      {ai && (
        <div className="bg-black/30 rounded-xl p-3 mb-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-purple-300 font-bold">🤖 IA prédit :</span>
            <span className="text-white font-bold">
              {ai.scoreA} – {ai.scoreB}
              <span className="ml-2 text-gray-300">
                ({ai.winner === "Draw" ? "Nul" : ai.winner})
              </span>
            </span>
            <span className={`font-bold ${getConfidenceColor(ai.confidence)}`}>
              {ai.confidence}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ai.confidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-1.5 rounded-full ${getConfidenceBg(ai.confidence)}`}
            />
          </div>
          <p className="text-gray-400 leading-relaxed">{ai.reasoning}</p>
          {userPred && editable && (
            <div className={`mt-2 font-semibold ${sameAsAI ? "text-green-400" : "text-orange-400"}`}>
              {sameAsAI ? "✅ Tu es d'accord avec l'IA" : "⚡ Tu défies l'IA !"}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!editable ? (
          <div className="flex-1 bg-white/5 text-gray-500 font-bold py-2 px-4 rounded-xl text-center text-sm">
            🔒 Verrouillé
          </div>
        ) : !saved ? (
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

        <motion.button
          whileTap={{ scale: editable ? 0.9 : 1 }}
          onClick={() => editable && onJoker(match.id)}
          className={`px-3 py-2 rounded-xl font-bold text-lg transition ${
            !editable
              ? "bg-white/5 text-gray-600 cursor-not-allowed"
              : isJoker
                ? "bg-yellow-400 text-black active:scale-95"
                : "bg-white/10 hover:bg-yellow-400/20 text-yellow-400 active:scale-95"
          }`}
        >
          ⭐
        </motion.button>
      </div>

      {/* Partage WhatsApp */}
      {saved && editable && (
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `⚽ Mon pronostic WC 2026 :\n` +
            `${FLAGS[match.teamA] ?? ""} ${match.teamA} ${scoreA}–${scoreB} ${match.teamB} ${FLAGS[match.teamB] ?? ""}` +
            `${isJoker ? " ⭐ JOKER" : ""}\n` +
            `🔥 https://world-cup-hub-kappa.vercel.app/`
          )}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 text-xs text-green-400 hover:text-green-300 transition"
        >
          📲 Partager sur WhatsApp
        </a>
      )}
    </motion.div>
  );
}
