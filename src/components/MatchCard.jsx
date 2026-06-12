// src/components/MatchCard.jsx
// Carte d'un match — conçu pour Predictions.jsx
// Props reçues : match, prediction, isJoker, onSave, onJoker
// Imports alignés sur tes fichiers : aiPredictions.js, scoring.js, matches.js

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FLAGS } from "../data/matches";
import { AI_PREDICTIONS, getConfidenceColor, getConfidenceBg } from "../data/aiPredictions";
import { agreesWithAI } from "../utils/scoring";

export default function MatchCard({ match, prediction, isJoker, onSave, onJoker }) {
  const ai = AI_PREDICTIONS[match.id];

  const [scoreA, setScoreA] = useState(prediction?.scoreA ?? "");
  const [scoreB, setScoreB] = useState(prediction?.scoreB ?? "");
  const [saved,  setSaved]  = useState(!!prediction);

  const hasInput = scoreA !== "" && scoreB !== "";
  const userPred = hasInput
    ? { scoreA: Number(scoreA), scoreB: Number(scoreB) }
    : null;

  // Compare résultat prédit user vs IA (victoire/nul/défaite)
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
        ${isJoker
          ? "border-yellow-400 shadow-yellow-400/30 shadow-lg"
          : "border-white/10"
        }`}
    >

      {/* ── Badge joker ── */}
      {isJoker && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow">
          ⭐ JOKER ×2
        </div>
      )}

      {/* ── Groupe · stade · heure ── */}
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>Groupe {match.group}</span>
        <span>📍 {match.stadium}</span>
        <span>🕒 {match.date} {match.time}</span>
      </div>

      {/* ── Équipes + saisie score ── */}
      <div className="flex items-center justify-between mb-4">

        {/* Équipe A */}
        <div className="text-center flex-1">
          <div className="text-3xl mb-1">{FLAGS[match.teamA] ?? "🏳️"}</div>
          <div className="font-bold text-sm leading-tight">{match.teamA}</div>
        </div>

        {/* Score */}
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

        {/* Équipe B */}
        <div className="text-center flex-1">
          <div className="text-3xl mb-1">{FLAGS[match.teamB] ?? "🏳️"}</div>
          <div className="font-bold text-sm leading-tight">{match.teamB}</div>
        </div>
      </div>

      {/* ── Prédiction IA ── */}
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

          {/* Barre de confiance */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ai.confidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-1.5 rounded-full ${getConfidenceBg(ai.confidence)}`}
            />
          </div>

          <p className="text-gray-400 leading-relaxed">{ai.reasoning}</p>

          {/* Accord / désaccord avec l'IA */}
          {userPred && (
            <div className={`mt-2 font-semibold ${sameAsAI ? "text-green-400" : "text-orange-400"}`}>
              {sameAsAI ? "✅ Tu es d'accord avec l'IA" : "⚡ Tu défies l'IA !"}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-2">

        {/* Valider / Modifier */}
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

        {/* Bouton joker */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onJoker(match.id)}
          title={isJoker ? "Joker actif — cliquer pour retirer" : "Utiliser mon joker ici (×2 points)"}
          className={`px-3 py-2 rounded-xl font-bold text-lg transition active:scale-95
            ${isJoker
              ? "bg-yellow-400 text-black"
              : "bg-white/10 hover:bg-yellow-400/20 text-yellow-400"
            }`}
        >
          ⭐
        </motion.button>
      </div>

      {/* ── Partage WhatsApp (si sauvegardé) ── */}
      {saved && (
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `⚽ Mon pronostic sur World Cup Hub 2026 :\n` +
            `${FLAGS[match.teamA] ?? ""} ${match.teamA} ${scoreA} – ${scoreB} ${match.teamB} ${FLAGS[match.teamB] ?? ""}` +
            `${isJoker ? " ⭐ JOKER" : ""}\n` +
            `Groupe ${match.group} · ${match.date}\n` +
            `🔥 https://world-cup-hub-kappa.vercel.app/`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 text-xs text-green-400 hover:text-green-300 transition"
        >
          📲 Partager sur WhatsApp
        </a>
      )}
    </motion.div>
  );
}